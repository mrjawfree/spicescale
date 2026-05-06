import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3";

const STALE_DAYS = 14;
const RATE_LIMIT_DAYS = 7;

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${Deno.env.get("CRON_SECRET")}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  webpush.setVapidDetails(
    Deno.env.get("VAPID_SUBJECT")!,
    Deno.env.get("VAPID_PUBLIC_KEY")!,
    Deno.env.get("VAPID_PRIVATE_KEY")!
  );

  const staleCutoff = new Date();
  staleCutoff.setDate(staleCutoff.getDate() - STALE_DAYS);

  const rateLimitCutoff = new Date();
  rateLimitCutoff.setDate(rateLimitCutoff.getDate() - RATE_LIMIT_DAYS);

  const { data: staleRecipes, error: recipeErr } = await supabase
    .from("recipes")
    .select("id, user_id, title, created_at")
    .lt("created_at", staleCutoff.toISOString())
    .order("created_at", { ascending: true });

  if (recipeErr) {
    return new Response(JSON.stringify({ error: recipeErr.message }), {
      status: 500,
    });
  }

  const userRecipeMap = new Map<string, { id: string; title: string }>();
  for (const recipe of staleRecipes ?? []) {
    if (!userRecipeMap.has(recipe.user_id)) {
      userRecipeMap.set(recipe.user_id, {
        id: recipe.id,
        title: recipe.title,
      });
    }
  }

  let sent = 0;
  let skippedRateLimit = 0;
  let failed = 0;

  for (const [userId, recipe] of userRecipeMap) {
    const { data: recentNotif } = await supabase
      .from("push_notification_log")
      .select("id")
      .eq("user_id", userId)
      .gte("sent_at", rateLimitCutoff.toISOString())
      .limit(1)
      .maybeSingle();

    if (recentNotif) {
      skippedRateLimit++;
      continue;
    }

    const { data: subscription } = await supabase
      .from("push_subscriptions")
      .select("endpoint, keys_p256dh, keys_auth")
      .eq("user_id", userId)
      .maybeSingle();

    if (!subscription) continue;

    const pushPayload = JSON.stringify({
      title: "Time to cook!",
      body: `You haven't made "${recipe.title}" in a while. Tap to check it out!`,
      data: { recipeId: recipe.id },
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
    });

    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys_p256dh,
            auth: subscription.keys_auth,
          },
        },
        pushPayload
      );

      await supabase.from("push_notification_log").insert({
        user_id: userId,
        recipe_id: recipe.id,
        notification_type: "stale_recipe",
      });

      sent++;
    } catch (err) {
      failed++;
      if ((err as { statusCode?: number }).statusCode === 410) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", userId);
      }
    }
  }

  return new Response(
    JSON.stringify({ sent, skippedRateLimit, failed }),
    { headers: { "Content-Type": "application/json" } }
  );
});
