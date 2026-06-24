import Stripe from "https://esm.sh/stripe@14";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);

const PRICES = {
  monthly: "price_1TlpbdRwgxkcKRlyGfzsdI5t",
  yearly: "price_1TlpbgRwgxkcKRlyHh58jEzU",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" } });
  }

  try {
    const { plan, user_id, email } = await req.json();
    const price = PRICES[plan as keyof typeof PRICES];
    if (!price) throw new Error("Plano invalido");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      success_url: "https://motordrive.app/dashboard?upgraded=true",
      cancel_url: "https://motordrive.app/planos",
      customer_email: email,
      subscription_data: {
        trial_period_days: 7,
        metadata: { user_id },
      },
      metadata: { user_id },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
