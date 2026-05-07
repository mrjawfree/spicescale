create table if not exists recipe_ratings (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recipe_id, user_id)
);

alter table recipe_ratings enable row level security;

create policy "Users can read all ratings"
  on recipe_ratings for select
  using (true);

create policy "Users can insert own ratings"
  on recipe_ratings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own ratings"
  on recipe_ratings for update
  using (auth.uid() = user_id);

create policy "Users can delete own ratings"
  on recipe_ratings for delete
  using (auth.uid() = user_id);

create index idx_recipe_ratings_recipe_id on recipe_ratings(recipe_id);
create index idx_recipe_ratings_user_id on recipe_ratings(user_id);
