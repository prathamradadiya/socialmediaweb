const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
    {
        subscriberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        creatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subscriptionPlans",
            required: true,
        },
        stripeSubscriptionId: {
            type: String,
            default: null,
        },
        stripeCustomerId: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ["active", "canceled", "past_due", "expired"],
            default: "active",
        },
        currentPeriodStart: {
            type: Date,
            default: null,
        },
        currentPeriodEnd: {
            type: Date,
            default: null,
        },
        canceledAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

subscriptionSchema.index({ subscriberId: 1, creatorId: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });

const Subscription = mongoose.model("subscriptions", subscriptionSchema);

module.exports = Subscription;
