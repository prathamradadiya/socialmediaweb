const Stripe = require("stripe");
require("dotenv").config(); // MUST be before using env

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
