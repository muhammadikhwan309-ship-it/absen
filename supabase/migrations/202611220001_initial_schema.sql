-- PlantTrack AI production schema (PostgreSQL / Supabase)
create extension if not exists pgcrypto;

create type public.app_role as enum ('super_admin','factory_admin','hrd','supervisor','security','employee');
create type public.attendance_event_type as enum ('check_in','check_out');
create type public.review_status as enum ('pending','approved','rejected','escalated');
create type public.camera_status as enum ('online','offline','unknown');

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);
create table public.factories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  address text,
  latitude double precision,
  longitude double precision,
  timezone text not null default 'Asia/Jakarta',
  created_at timestamptz not null default now()
);
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete restrict,
  factory_id uuid references public.factories(id) on delete set null,
  full_name text not null,
  role public.app_role not null default 'employee',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  factory_id uuid not null references public.factories(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique(factory_id,name)
);
create table public.areas (
  id uuid primary key default gen_random_uuid(),
  factory_id uuid not null references public.factories(id) on delete cascade,
  name text not null,
  area_type text not null default 'work_area',
  boundary_geojson jsonb,
  created_at timestamptz not null default now()
);
create table public.gates (
  id uuid primary key default gen_random_uuid(),
  factory_id uuid not null references public.factories(id) on delete cascade,
  area_id uuid references public.areas(id) on delete set null,
  name text not null,
  direction_mode text not null check (direction_mode in ('in_only','out_only','virtual_line','sensor')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.cameras (
  id uuid primary key default gen_random_uuid(),
  factory_id uuid not null references public.factories(id) on delete cascade,
  area_id uuid references public.areas(id) on delete set null,
  gate_id uuid references public.gates(id) on delete set null,
  name text not null,
  external_ref text unique,
  status public.camera_status not null default 'unknown',
  stream_secret_hash text,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  factory_id uuid not null references public.factories(id) on delete cascade,
  name text not null,
  start_time time not null,
  end_time time not null,
  tolerance_minutes integer not null default 0 check (tolerance_minutes between 0 and 240),
  crosses_midnight boolean not null default false,
  work_days smallint[] not null default array[1,2,3,4,5]::smallint[],
  created_at timestamptz not null default now()
);
create table public.employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  factory_id uuid not null references public.factories(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  shift_id uuid references public.shifts(id) on delete set null,
  employee_code text not null,
  full_name text not null,
  job_title text,
  employment_status text not null default 'active' check (employment_status in ('active','inactive','suspended')),
  biometric_reference text,
  alternative_attendance_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id,employee_code)
);
create table public.attendance_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  factory_id uuid not null references public.factories(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete set null,
  camera_id uuid references public.cameras(id) on delete set null,
  gate_id uuid references public.gates(id) on delete set null,
  event_type public.attendance_event_type,
  occurred_at timestamptz not null,
  direction text check (direction in ('in','out','unknown')),
  confidence numeric(5,4) check (confidence is null or confidence between 0 and 1),
  source text not null default 'camera',
  status text not null default 'needs_review' check (status in ('verified','needs_review','rejected','duplicate','pending_sync')),
  review_status public.review_status not null default 'pending',
  review_reason text,
  external_event_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(factory_id,external_event_id)
);
create index attendance_events_factory_time_idx on public.attendance_events(factory_id,occurred_at desc);
create index attendance_events_employee_time_idx on public.attendance_events(employee_id,occurred_at desc);
create table public.review_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.attendance_events(id) on delete cascade,
  reviewer_id uuid references public.profiles(id) on delete set null,
  decision public.review_status not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  before_value jsonb,
  after_value jsonb,
  created_at timestamptz not null default now()
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  factory_id uuid references public.factories(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete cascade,
  category text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.current_company_id()
returns uuid language sql stable security definer set search_path=public
as $$ select company_id from public.profiles where id=auth.uid() and is_active=true $$;
create or replace function public.current_factory_id()
returns uuid language sql stable security definer set search_path=public
as $$ select factory_id from public.profiles where id=auth.uid() and is_active=true $$;
create or replace function public.has_role(allowed public.app_role[])
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where id=auth.uid() and is_active=true and role=any(allowed)) $$;

alter table public.companies enable row level security;
alter table public.factories enable row level security;
alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.areas enable row level security;
alter table public.gates enable row level security;
alter table public.cameras enable row level security;
alter table public.shifts enable row level security;
alter table public.employees enable row level security;
alter table public.attendance_events enable row level security;
alter table public.review_logs enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

create policy "company members read company" on public.companies for select using (id=public.current_company_id());
create policy "members read factories" on public.factories for select using (company_id=public.current_company_id());
create policy "users read own profile" on public.profiles for select using (id=auth.uid() or company_id=public.current_company_id());
create policy "admins manage profiles" on public.profiles for all using (company_id=public.current_company_id() and public.has_role(array['super_admin','factory_admin']::public.app_role[])) with check (company_id=public.current_company_id() and public.has_role(array['super_admin','factory_admin']::public.app_role[]));
create policy "members read departments" on public.departments for select using (factory_id in (select id from public.factories where company_id=public.current_company_id()));
create policy "admins manage departments" on public.departments for all using (factory_id=public.current_factory_id() and public.has_role(array['super_admin','factory_admin','hrd']::public.app_role[])) with check (factory_id=public.current_factory_id() and public.has_role(array['super_admin','factory_admin','hrd']::public.app_role[]));
create policy "members read areas" on public.areas for select using (factory_id in (select id from public.factories where company_id=public.current_company_id()));
create policy "admins manage areas" on public.areas for all using (factory_id=public.current_factory_id() and public.has_role(array['super_admin','factory_admin']::public.app_role[])) with check (factory_id=public.current_factory_id() and public.has_role(array['super_admin','factory_admin']::public.app_role[]));
create policy "members read gates" on public.gates for select using (factory_id in (select id from public.factories where company_id=public.current_company_id()));
create policy "admins manage gates" on public.gates for all using (factory_id=public.current_factory_id() and public.has_role(array['super_admin','factory_admin']::public.app_role[])) with check (factory_id=public.current_factory_id() and public.has_role(array['super_admin','factory_admin']::public.app_role[]));
create policy "members read cameras" on public.cameras for select using (factory_id in (select id from public.factories where company_id=public.current_company_id()));
create policy "admins manage cameras" on public.cameras for all using (factory_id=public.current_factory_id() and public.has_role(array['super_admin','factory_admin','security']::public.app_role[])) with check (factory_id=public.current_factory_id() and public.has_role(array['super_admin','factory_admin','security']::public.app_role[]));
create policy "members read shifts" on public.shifts for select using (factory_id in (select id from public.factories where company_id=public.current_company_id()));
create policy "hr manage shifts" on public.shifts for all using (factory_id=public.current_factory_id() and public.has_role(array['super_admin','factory_admin','hrd']::public.app_role[])) with check (factory_id=public.current_factory_id() and public.has_role(array['super_admin','factory_admin','hrd']::public.app_role[]));
create policy "members read employees" on public.employees for select using (company_id=public.current_company_id());
create policy "hr manage employees" on public.employees for all using (company_id=public.current_company_id() and public.has_role(array['super_admin','factory_admin','hrd']::public.app_role[])) with check (company_id=public.current_company_id() and public.has_role(array['super_admin','factory_admin','hrd']::public.app_role[]));
create policy "authorized read attendance" on public.attendance_events for select using (company_id=public.current_company_id() and public.has_role(array['super_admin','factory_admin','hrd','supervisor','security']::public.app_role[]));
create policy "hr update attendance" on public.attendance_events for update using (company_id=public.current_company_id() and public.has_role(array['super_admin','factory_admin','hrd']::public.app_role[])) with check (company_id=public.current_company_id() and public.has_role(array['super_admin','factory_admin','hrd']::public.app_role[]));
create policy "reviewers read review logs" on public.review_logs for select using (exists(select 1 from public.attendance_events e where e.id=event_id and e.company_id=public.current_company_id()));
create policy "reviewers create review logs" on public.review_logs for insert with check (reviewer_id=auth.uid() and public.has_role(array['super_admin','factory_admin','hrd','supervisor','security']::public.app_role[]));
create policy "admins read audit logs" on public.audit_logs for select using (company_id=public.current_company_id() and public.has_role(array['super_admin','factory_admin']::public.app_role[]));
create policy "users read own notifications" on public.notifications for select using (company_id=public.current_company_id() and (recipient_id=auth.uid() or recipient_id is null));
create policy "users update own notifications" on public.notifications for update using (recipient_id=auth.uid()) with check (recipient_id=auth.uid());

-- Database-side guard: camera events are accepted only when the camera, employee,
-- gate direction and confidence are sufficiently clear. Ambiguous events stay in review.
create or replace function public.ingest_camera_event(
  p_camera_id uuid,
  p_external_event_id text,
  p_employee_id uuid,
  p_occurred_at timestamptz,
  p_direction text,
  p_confidence numeric,
  p_metadata jsonb default '{}'::jsonb
) returns public.attendance_events
language plpgsql security definer set search_path=public
as $$
declare
  c public.cameras;
  e public.employees;
  g public.gates;
  sh public.shifts;
  local_time time;
  local_dow integer;
  local_tz text;
  shift_day integer;
  previous_event public.attendance_events;
  result public.attendance_events;
  resolved_type public.attendance_event_type;
  company_uuid uuid;
  reason text;
begin
  select * into c from public.cameras where id=p_camera_id and status <> 'offline';
  if not found then raise exception 'CAMERA_NOT_ACTIVE'; end if;
  select company_id,timezone into company_uuid,local_tz from public.factories where id=c.factory_id;
  if company_uuid is null then raise exception 'FACTORY_NOT_FOUND'; end if;
  select * into g from public.gates where id=c.gate_id and is_active=true;
  if not found then raise exception 'GATE_NOT_ACTIVE'; end if;
  if exists(select 1 from public.attendance_events where factory_id=c.factory_id and external_event_id=p_external_event_id) then
    select * into result from public.attendance_events where factory_id=c.factory_id and external_event_id=p_external_event_id;
    return result;
  end if;
  if p_direction not in ('in','out') or p_confidence is null or p_confidence < 0.92 or p_employee_id is null then
    reason := 'Arah, identitas, atau confidence belum memenuhi ambang verifikasi';
  elsif (g.direction_mode='in_only' and p_direction<>'in') or (g.direction_mode='out_only' and p_direction<>'out') then
    reason := 'Arah lintasan tidak sesuai konfigurasi gerbang';
  else
    select * into e from public.employees where id=p_employee_id and factory_id=c.factory_id and employment_status='active';
    if not found then reason := 'Karyawan tidak aktif atau tidak ditemukan pada pabrik ini';
    else
      select * into sh from public.shifts where id=e.shift_id and factory_id=c.factory_id;
      if not found then reason := 'Karyawan belum memiliki shift aktif';
      else
        local_time := (p_occurred_at at time zone coalesce(local_tz,'Asia/Jakarta'))::time;
        local_dow := extract(isodow from (p_occurred_at at time zone coalesce(local_tz,'Asia/Jakarta')))::integer;
        shift_day := case when sh.crosses_midnight and local_time <= sh.end_time then ((local_dow + 5) % 7) + 1 else local_dow end;
        if not (shift_day = any(sh.work_days)) or
          (not sh.crosses_midnight and (local_time < sh.start_time - interval '2 hours' or local_time > sh.end_time + interval '2 hours')) or
          (sh.crosses_midnight and not (local_time >= sh.start_time - interval '2 hours' or local_time <= sh.end_time + interval '2 hours')) then
          reason := 'Waktu event berada di luar rentang shift yang dikonfigurasi';
        end if;
      end if;
      if reason is null then
      select * into previous_event from public.attendance_events
      where employee_id=e.id and status='verified'
        and occurred_at >= date_trunc('day',p_occurred_at) - interval '1 day'
      order by occurred_at desc limit 1;
      if p_direction='in' then
        if previous_event.id is not null and previous_event.event_type='check_in' and previous_event.occurred_at > p_occurred_at - interval '90 seconds' then
          reason := 'Event masuk duplikat dalam jendela 90 detik';
        elsif previous_event.id is not null and previous_event.event_type='check_in' then
          reason := 'Karyawan belum memiliki check-out dari event masuk sebelumnya';
        else resolved_type := 'check_in'; end if;
      else
        if previous_event.id is null or previous_event.event_type <> 'check_in' then
          reason := 'Check-out tidak memiliki check-in yang sesuai';
        else resolved_type := 'check_out'; end if;
      end if;
      end if;
    end if;
  end if;
  insert into public.attendance_events(company_id,factory_id,employee_id,camera_id,gate_id,event_type,occurred_at,direction,confidence,status,review_status,review_reason,external_event_id,metadata)
  values(company_uuid,c.factory_id,case when reason is null then p_employee_id else null end,c.id,c.gate_id,
    case when reason is null then resolved_type else null end,p_occurred_at,p_direction,p_confidence,
    case when reason is null then 'verified' else 'needs_review' end,
    case when reason is null then 'approved' else 'pending' end,reason,p_external_event_id,coalesce(p_metadata,'{}'::jsonb))
  returning * into result;
  return result;
end $$;
revoke all on function public.ingest_camera_event(uuid,text,uuid,timestamptz,text,numeric,jsonb) from public, anon, authenticated;
grant execute on function public.ingest_camera_event(uuid,text,uuid,timestamptz,text,numeric,jsonb) to service_role;


-- Atomic review decision: update event, review history and audit trail in one transaction.
create or replace function public.review_attendance_event(
  p_event_id uuid,
  p_reviewer_id uuid,
  p_decision public.review_status,
  p_reason text
) returns public.attendance_events
language plpgsql security definer set search_path=public
as $$
declare
  reviewer public.profiles;
  target public.attendance_events;
  old_status text;
  old_review_status public.review_status;
begin
  select * into reviewer from public.profiles where id=p_reviewer_id and is_active=true;
  if not found or reviewer.role not in ('super_admin','factory_admin','hrd','supervisor','security') then
    raise exception 'REVIEW_FORBIDDEN';
  end if;
  if length(trim(coalesce(p_reason,''))) < 3 then raise exception 'REVIEW_REASON_REQUIRED'; end if;
  select * into target from public.attendance_events
    where id=p_event_id and company_id=reviewer.company_id for update;
  if not found then raise exception 'EVENT_NOT_FOUND'; end if;
  if p_decision not in ('approved','rejected','escalated') then raise exception 'INVALID_REVIEW_DECISION'; end if;
  old_status := target.status;
  old_review_status := target.review_status;
  update public.attendance_events set
    review_status=p_decision,
    status=case when p_decision='approved' then 'verified' when p_decision='rejected' then 'rejected' else 'needs_review' end,
    review_reason=trim(p_reason)
  where id=p_event_id returning * into target;
  insert into public.review_logs(event_id,reviewer_id,decision,reason)
  values(p_event_id,p_reviewer_id,p_decision,trim(p_reason));
  insert into public.audit_logs(company_id,actor_id,action,target_type,target_id,before_value,after_value)
  values(reviewer.company_id,p_reviewer_id,'attendance.reviewed','attendance_event',p_event_id::text,
    jsonb_build_object('status',old_status,'review_status',old_review_status),
    jsonb_build_object('status',target.status,'review_status',p_decision,'reason',trim(p_reason)));
  return target;
end $$;
revoke all on function public.review_attendance_event(uuid,uuid,public.review_status,text) from public, anon, authenticated;
grant execute on function public.review_attendance_event(uuid,uuid,public.review_status,text) to service_role;
