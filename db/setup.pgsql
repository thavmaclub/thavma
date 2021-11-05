drop table codes cascade;
drop table users cascade;
drop domain phone cascade;

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
