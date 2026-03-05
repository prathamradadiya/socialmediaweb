const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
    {
        creatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        price: {
            type: Number,
            required: true, // in cents (e.g. 999 = $9.99)
        },
        currency: {
            type: String,
            default: "usd",
        },
        interval: {
            type: String,
            enum: ["monthly", "yearly"],
            default: "monthly",
        },
        stripePriceId: {
            type: String,
            default: null,
        },
        stripeProductId: {
            type: String,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

subscriptionPlanSchema.index({ creatorId: 1, isActive: 1 });

const SubscriptionPlan = mongoose.model(
    "subscriptionPlans",
    subscriptionPlanSchema
);

module.exports = SubscriptionPlan;
