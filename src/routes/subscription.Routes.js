const router = require("express").Router();

const {
  createPlan,
  getPlans,
  updatePlan,
  deletePlan,
  createCheckoutSession,
  handleWebhook, // 👈 IMPORTANT (you added this)
} = require("../controllers/subscription.controller");

const { authMiddleware } = require("../middlewares/auth.middleware");

// ============================================================
// PLAN CRUD
// ============================================================

router.post("/create-plan", authMiddleware, createPlan);

router.get("/plans/:creatorId", authMiddleware, getPlans);

router.put("/update-plan/:planId", authMiddleware, updatePlan);

router.delete("/delete-plan/:planId", authMiddleware, deletePlan);

// ============================================================
// CHECKOUT & SUBSCRIPTION
// ============================================================

router.post("/checkout", authMiddleware, createCheckoutSession);

// router.post("/cancel", authMiddleware, cancelSubscription);

// ============================================================
// QUERIES
// ============================================================

// router.get("/my-subscriptions", authMiddleware, getMySubscriptions);

// router.get("/my-subscribers", authMiddleware, getMySubscribers);

// router.get("/check/:creatorId", authMiddleware, checkSubscription);

// ============================================================
// STRIPE WEBHOOK  ⚠️ NO authMiddleware here
// ============================================================
// Stripe must call this publicly

// router.post(
//   "/webhook",
//   require("express").raw({ type: "application/json" }), // REQUIRED for Stripe
//   handleWebhook,
// );

module.exports = router;
