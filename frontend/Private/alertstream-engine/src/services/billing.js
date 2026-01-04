// Complete subscription and billing system
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const logger = require('../utils/logger');

class BillingService {
  constructor() {
    this.plans = {
      'free': {
        id: 'free',
        name: 'Free',
        price: 0,
        smsLimit: 100,
        features: ['basic_monitoring', 'email_alerts'],
        stripePriceId: null
      },
      'pro': {
        id: 'pro',
        name: 'Pro',
        price: 29,
        smsLimit: 1000,
        features: ['advanced_monitoring', 'sms_alerts', 'web_monitoring'],
        stripePriceId: process.env.STRIPE_PRICE_PRO
      },
      'business': {
        id: 'business',
        name: 'Business',
        price: 99,
        smsLimit: 10000,
        features: ['everything', 'priority_support', 'custom_rules'],
        stripePriceId: process.env.STRIPE_PRICE_BUSINESS
      }
    };
  }
  
  async createCustomer(user) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user.id,
        signupDate: new Date().toISOString()
      }
    });
    
    // Store in database
    await this.storeStripeCustomerId(user.id, customer.id);
    
    return customer;
  }
  
  async createSubscription(user, planId, paymentMethodId) {
    const plan = this.plans[planId];
    
    if (!plan || !plan.stripePriceId) {
      throw new Error('Invalid plan or free plan selected');
    }
    
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId
    });
    
    // Set as default
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
    
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      items: [{ price: plan.stripePriceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: user.id,
        plan: planId
      }
    });
    
    // Update user's plan
    await this.updateUserPlan(user.id, planId, subscription.id);
    
    return {
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      status: subscription.status
    };
  }
  
  async handleWebhook(rawBody, signature) {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      logger.error('Stripe webhook signature verification failed:', err);
      throw new Error('Invalid signature');
    }
    
    const { type, data } = event;
    
    switch (type) {
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCancelled(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
    }
    
    return { processed: true };
  }
  
  async handlePaymentSucceeded(invoice) {
    const userId = invoice.metadata?.userId;
    if (!userId) return;
    
    // Update user's billing period
    await this.extendUserSubscription(userId, invoice.period_end);
    
    // Send receipt
    await this.sendReceipt(userId, invoice);
    
    // Log for accounting
    await this.logRevenue(invoice);
    
    logger.info(`Payment succeeded for user ${userId}`, { 
      amount: invoice.amount_paid 
    });
  }
  
  async handlePaymentFailed(invoice) {
    const userId = invoice.metadata?.userId;
    if (!userId) return;
    
    // Notify user
    await this.sendPaymentFailedNotification(userId);
    
    // Grace period logic
    const gracePeriodEnd = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
    
    await this.setGracePeriod(userId, gracePeriodEnd);
    
    logger.warn(`Payment failed for user ${userId}`);
  }
  
  async handleSubscriptionCancelled(subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;
    
    await this.downgradeToFree(userId);
    
    logger.info(`Subscription cancelled for user ${userId}`);
  }
  
  async handleSubscriptionUpdated(subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;
    
    // Update user's plan based on new subscription
    const planId = this.getPlanFromPriceId(subscription.items.data[0].price.id);
    await this.updateUserPlan(userId, planId, subscription.id);
    
    logger.info(`Subscription updated for user ${userId}`, { planId });
  }
  
  async checkUsageAndBill(userId) {
    const user = await this.getUser(userId);
    const usage = await this.getCurrentUsage(userId);
    
    if (usage.smsCount > user.plan.smsLimit) {
      // Overage charges
      const overage = usage.smsCount - user.plan.smsLimit;
      const overageCharge = overage * 0.01; // $0.01 per SMS
      
      await this.chargeOverage(userId, overageCharge);
    }
    
    return { usage, limit: user.plan.smsLimit };
  }

  // Database helper methods
  async storeStripeCustomerId(userId, customerId) {
    const db = require('../config/database');
    await db.query(
      'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
      [customerId, userId]
    );
  }

  async updateUserPlan(userId, planId, subscriptionId) {
    const db = require('../config/database');
    await db.query(
      `UPDATE users SET plan_id = $1, subscription_id = $2, updated_at = NOW() 
       WHERE id = $3`,
      [planId, subscriptionId, userId]
    );
  }

  async extendUserSubscription(userId, periodEnd) {
    const db = require('../config/database');
    await db.query(
      'UPDATE users SET subscription_ends_at = to_timestamp($1) WHERE id = $2',
      [periodEnd, userId]
    );
  }

  async setGracePeriod(userId, gracePeriodEnd) {
    const db = require('../config/database');
    await db.query(
      'UPDATE users SET grace_period_ends_at = to_timestamp($1) WHERE id = $2',
      [gracePeriodEnd / 1000, userId]
    );
  }

  async downgradeToFree(userId) {
    const db = require('../config/database');
    await db.query(
      `UPDATE users SET plan_id = 'free', subscription_id = NULL, updated_at = NOW() 
       WHERE id = $1`,
      [userId]
    );
  }

  async getUser(userId) {
    const db = require('../config/database');
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];
    if (user) {
      user.plan = this.plans[user.plan_id] || this.plans.free;
    }
    return user;
  }

  async getCurrentUsage(userId) {
    const db = require('../config/database');
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const result = await db.query(
      `SELECT COUNT(*) as sms_count FROM sms_messages 
       WHERE user_id = $1 AND sent_at >= $2`,
      [userId, startOfMonth]
    );
    
    return { smsCount: parseInt(result.rows[0].sms_count) };
  }

  async chargeOverage(userId, amount) {
    const user = await this.getUser(userId);
    
    await stripe.invoiceItems.create({
      customer: user.stripe_customer_id,
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      description: 'SMS Overage Charges'
    });
    
    logger.info(`Overage charge created for user ${userId}`, { amount });
  }

  async sendReceipt(userId, invoice) {
    // Send receipt email
    const emailService = require('./emailService');
    const user = await this.getUser(userId);
    
    await emailService.send({
      to: user.email,
      subject: 'AlertStream Payment Receipt',
      template: 'payment-receipt',
      data: {
        amount: (invoice.amount_paid / 100).toFixed(2),
        date: new Date().toLocaleDateString(),
        invoiceId: invoice.id
      }
    });
  }

  async sendPaymentFailedNotification(userId) {
    const emailService = require('./emailService');
    const user = await this.getUser(userId);
    
    await emailService.send({
      to: user.email,
      subject: 'AlertStream - Payment Failed',
      template: 'payment-failed',
      data: {
        updatePaymentUrl: `${process.env.DASHBOARD_URL}/billing/update-payment`
      }
    });
  }

  async logRevenue(invoice) {
    const db = require('../config/database');
    await db.query(
      `INSERT INTO revenue_logs (invoice_id, amount, currency, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [invoice.id, invoice.amount_paid, invoice.currency]
    );
  }

  getPlanFromPriceId(priceId) {
    for (const [planId, plan] of Object.entries(this.plans)) {
      if (plan.stripePriceId === priceId) return planId;
    }
    return 'free';
  }

  // Get billing overview for dashboard
  async getBillingOverview(userId) {
    const user = await this.getUser(userId);
    const usage = await this.getCurrentUsage(userId);
    
    return {
      plan: user.plan,
      usage: {
        smsUsed: usage.smsCount,
        smsLimit: user.plan.smsLimit,
        percentage: Math.round((usage.smsCount / user.plan.smsLimit) * 100)
      },
      subscriptionEndsAt: user.subscription_ends_at,
      nextBillingDate: user.subscription_ends_at
    };
  }
}

module.exports = new BillingService();
