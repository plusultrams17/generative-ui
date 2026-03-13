import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });
}

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = getAdminSupabase();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null;

        if (!subscriptionId) {
          console.error("[webhook] checkout.session.completed missing subscriptionId");
          return NextResponse.json({ error: "Missing subscriptionId" }, { status: 400 });
        }

        // Try metadata first, then fall back to customer lookup
        let targetUserId = userId;
        if (!targetUserId && customerId) {
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();
          targetUserId = existingProfile?.id ?? null;
        }

        if (!targetUserId) {
          console.error("[webhook] Cannot find user for checkout session", {
            userId,
            customerId,
            sessionId: session.id,
          });
          return NextResponse.json({ error: "User not found" }, { status: 400 });
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            plan: "pro",
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
          })
          .eq("id", targetUserId);

        if (error) {
          console.error("[webhook] Failed to update profile:", error);
          return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id ?? null;

        if (customerId) {
          const { error } = await supabase
            .from("profiles")
            .update({
              plan: "free",
              stripe_subscription_id: null,
            })
            .eq("stripe_customer_id", customerId);

          if (error) {
            console.error("[webhook] Failed to downgrade:", error);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id ?? null;
        const isActive = ["active", "trialing"].includes(subscription.status);

        if (customerId) {
          const { error } = await supabase
            .from("profiles")
            .update({
              plan: isActive ? "pro" : "free",
            })
            .eq("stripe_customer_id", customerId);

          if (error) {
            console.error("[webhook] Failed to update subscription:", error);
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error("[webhook] Unhandled error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
