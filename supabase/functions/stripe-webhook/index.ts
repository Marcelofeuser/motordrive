import Stripe from "https://esm.sh/stripe@14";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err) {
    return new Response("Webhook Error: " + err.message, { status: 400 });
  }

  const getSubscription = async (sub: Stripe.Subscription) => {
    const user_id = sub.metadata?.user_id;
    if (!user_id) return;

    const status = sub.status;
    const plan = sub.items.data[0]?.price?.recurring?.interval === "year" ? "yearly" : "monthly";
    const current_period_end = new Date((sub as any).current_period_end * 1000).toISOString();

    await supabase.from("subscriptions").upsert({
      user_id,
      stripe_subscription_id: sub.id,
      stripe_customer_id: sub.customer as string,
      status,
      plan,
      current_period_end,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  };

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await getSubscription(event.data.object as Stripe.Subscription);
      break;
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
