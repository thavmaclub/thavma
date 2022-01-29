drop function code_exists;
drop table assessments;
drop type question;
drop table codes;
drop table users;
drop domain phone;

create type question as (
  "question" text,
  "answers" text[],
  "answer" int
);
create table assessments (
  "id" bigint generated always as identity primary key,
  "creator" uuid not null references auth.users(id),
  "name" text not null,
  "pwd" text not null,
  "date" timestamptz not null,
  "questions" question[] not null
);
alter publication supabase_realtime add table assessments;
alter table assessments enable row level security;
create policy "Assessments can be created by users"
  on assessments for insert with check (
    auth.uid() = "creator"
  );
create policy "Assessments are viewable by their creators"
  on assessments for select using (
    auth.uid() = "creator"
  );

create table codes (
  "id" text unique not null primary key,
  "creator" uuid not null references auth.users(id),
  "user" uuid references auth.users(id) unique
);
alter table codes enable row level security;
-- TODO: Check that the user is filtering by a specific code ID.
create policy "Unused codes are viewable by everyone" 
  on codes for select using (
    "user" is null
  );
create policy "Unused codes can be used by logged in users"
  on codes for update using (
    "user" is null
  ) with check (
    auth.uid() = "user" and "user" != "creator"
  );
create policy "Used codes are viewable by their users"
  on codes for select using (
    auth.uid() = "user"
  );
create policy "Used codes can be reused by their users"
  on codes for update using (
    auth.uid() = "user"
  ) with check (
    auth.uid() = "user" and "user" != "creator"
  );
-- Checks if a code exists (even if that code has already been used and the user
-- isn't logged in yet and thus can't check themselves directly; see RLS rules).
-- @see {@link https://github.com/supabase/supabase/issues/4956}
create function code_exists(code text)
returns boolean
as $$
  select exists (select id from codes where id = code)
$$
language sql stable security definer;

create domain phone as text check (value ~ '^(\+\d{1,3})\d{10}$');
create table users (
  "id" uuid not null references auth.users(id) primary key,
  "phone" phone unique not null
);
alter table users enable row level security;
create policy "Users can view their own profiles"
  on users for select using (
    auth.uid() = "id"
  );
