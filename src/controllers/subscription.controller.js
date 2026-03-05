const stripe = require("../config/stripe");
const { User, Subscription, SubscriptionPlan } = require("../models");
const response = require("../helper/response/response");

// ============================================================
// CREATE PLAN
// ============================================================
exports.createPlan = async (req, res) => {
  try {
    const creatorId = req.user._id;
    const { name, description, price, currency, interval } = req.body;

    if (!name || !price) {
      return response.error(res, 9000, 400);
    }

    const product = await stripe.products.create({
      name,
      metadata: { creatorId: creatorId.toString() },
    });

    const stripePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: price,
      currency: currency || "usd",
      recurring: {
        interval: interval === "yearly" ? "year" : "month",
      },
    });

    const plan = await SubscriptionPlan.create({
      creatorId,
      name,
      description: description || "",
      price,
      currency: currency || "usd",
      interval: interval || "monthly",
      stripeProductId: product.id,
      stripePriceId: stripePrice.id,
    });

    return response.success(res, 8001, plan, 201);
  } catch (err) {
    console.error("createPlan error:", err);
    return response.error(res, 9999, 500);
  }
};

// ============================================================
// GET PLANS
// ============================================================
exports.getPlans = async (req, res) => {
  try {
    const { creatorId } = req.params;

    const plans = await SubscriptionPlan.find({
      creatorId,
      isActive: true,
    }).sort({ price: 1 });

    return response.success(res, 8011, plans);
  } catch (err) {
    console.error("getPlans error:", err);
    return response.error(res, 9999, 500);
  }
};

// ============================================================
// UPDATE PLAN
// ============================================================
exports.updatePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const creatorId = req.user._id;
    const { name, description } = req.body;

    const plan = await SubscriptionPlan.findOne({
      _id: planId,
      creatorId,
      isActive: true,
    });

    if (!plan) return response.error(res, 8004, 404);

    if (name) plan.name = name;
    if (description !== undefined) plan.description = description;

    if (name && plan.stripeProductId) {
      await stripe.products.update(plan.stripeProductId, { name });
    }

    await plan.save();

    return response.success(res, 8002, plan);
  } catch (err) {
    console.error("updatePlan error:", err);
    return response.error(res, 9999, 500);
  }
};

// ============================================================
// DELETE PLAN
// ============================================================
exports.deletePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const creatorId = req.user._id;

    const plan = await SubscriptionPlan.findOne({
      _id: planId,
      creatorId,
      isActive: true,
    });

    if (!plan) return response.error(res, 8004, 404);

    plan.isActive = false;
    await plan.save();

    if (plan.stripePriceId) {
      await stripe.prices.update(plan.stripePriceId, { active: false });
    }

    return response.success(res, 8003);
  } catch (err) {
    console.error("deletePlan error:", err);
    return response.error(res, 9999, 500);
  }
};

// ============================================================
// CREATE CHECKOUT SESSION
// ============================================================
exports.createCheckoutSession = async (req, res) => {
  try {
    const subscriberId = req.user._id;
    const { planId } = req.body;

    if (!planId) return response.error(res, 9000, 400);

    const plan = await SubscriptionPlan.findOne({
      _id: planId,
      isActive: true,
    });
    if (!plan) return response.error(res, 8004, 404);

    const creatorId = plan.creatorId;

    if (creatorId.toString() === subscriberId.toString()) {
      return response.error(res, 8010, 400);
    }

    const existing = await Subscription.findOne({
      subscriberId,
      creatorId,
      status: "active",
    });

    if (existing) return response.error(res, 8008, 400);

    let user = await User.findById(subscriberId);
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: subscriberId.toString() },
      });

      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],

      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],

      subscription_data: {
        metadata: {
          subscriberId: subscriberId.toString(),
          creatorId: creatorId.toString(),
          planId: planId.toString(),
        },
      },

      success_url: `${process.env.Base_URL}/api/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.Base_URL}/api/subscription/cancel`,
    });

    return response.success(res, 8005, {
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    console.error("createCheckoutSession error:", err);
    return response.error(res, 9999, 500);
  }
};
// ============================================================
// STRIPE WEBHOOK (FULL + EXTRA EVENTS ADDED)
// ============================================================
exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.log("Stripe signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("Stripe Event:", event.type);

  const data = event.data.object;

  try {
    // ================================
    // SUBSCRIPTION CREATED
    // ================================
    if (event.type === "customer.subscription.created") {
      const metadata = data.metadata || {};

      if (!metadata.subscriberId || !metadata.creatorId || !metadata.planId) {
        console.log("Metadata missing, cannot save subscription");
        return res.status(200).json({ received: true });
      }

      const periodEnd = data.current_period_end
        ? new Date(data.current_period_end * 1000)
        : null;

      const exists = await Subscription.findOne({
        stripeSubscriptionId: data.id,
      });

      if (!exists) {
        await Subscription.create({
          subscriberId: metadata.subscriberId,
          creatorId: metadata.creatorId,
          planId: metadata.planId,
          stripeSubscriptionId: data.id,
          stripeCustomerId: data.customer,
          status: data.status,
          currentPeriodEnd: periodEnd,
        });

        console.log("Subscription saved in MongoDB");
      }
    }

    // ================================
    // PAYMENT SUCCESS
    // ================================
    if (event.type === "invoice.paid") {
      const periodEnd = data.lines?.data[0]?.period?.end;

      await Subscription.updateOne(
        { stripeSubscriptionId: data.subscription },
        {
          status: "active",
          ...(periodEnd && {
            currentPeriodEnd: new Date(periodEnd * 1000),
          }),
        },
      );

      console.log("Subscription activated/renewed");
    }

    // ================================
    // PAYMENT FAILED
    // ================================
    if (event.type === "invoice.payment_failed") {
      await Subscription.updateOne(
        { stripeSubscriptionId: data.subscription },
        { status: "past_due" },
      );

      console.log("Payment failed");
    }

    // ================================
    // SUBSCRIPTION CANCELLED
    // ================================
    if (event.type === "customer.subscription.deleted") {
      await Subscription.updateOne(
        { stripeSubscriptionId: data.id },
        { status: "cancelled" },
      );

      console.log("Subscription cancelled");
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.log("Webhook internal error:", err);
    res.status(500).json({ error: "Webhook failed" });
  }
};
