-- Push subscription storage for Web Push notifications
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  keys_p256dh text not null,
  keys_auth text not null,
  created_at timestamptz not null default now(),
  unique(user_id)
);

alter table push_subscriptions enable row level security;

create policy "Users manage own push subscription"
  on push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Rate-limiting log for push notifications
create table if not exists push_notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null,
  notification_type text not null default 'stale_recipe',
  sent_at timestamptz not null default now()
);

create index idx_push_log_user_sent on push_notification_log(user_id, sent_at desc);

alter table push_notification_log enable row level security;

create policy "Service role only for push log"
  on push_notification_log for all
  using (false);
