alter table recipes
  add column if not exists image_url text,
  add column if not exists spice_level smallint check (spice_level between 1 and 5),
  add column if not exists instructions text[] default '{}',
  add column if not exists nutrition jsonb;
