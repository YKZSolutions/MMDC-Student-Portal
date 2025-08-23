export type WebhookDataType = 'event';

export type PaymentAttributeType =
  | 'checkout_session.payment.paid'
  | 'link.payment.paid'
  | 'payment.paid'
  | 'payment.failed'
  | 'payment.refunded'
  | 'payment.refund.updated'
  | 'qrph.expired'
  | 'source.chargeable';

export type PaymentDataType =
  | 'source'
  | 'checkout_session'
  | 'link'
  | 'payment'
  | 'refund'
  | 'qrph';

// Metadata we defined in our payment intent
interface CustomMetadata {
  billingId?: string;
  userId?: string;
  installmentId?: string;
  installmentOrder?: number;
}

// ===== Base Webhook Envelope =====
interface PayMongoWebhookBase<T extends string, R> {
  data: {
    id: string;
    type: 'event';
    attributes: {
      type: T; // Discriminator
      livemode: boolean;
      data: R;
      previous_data?: Partial<R>;
      pending_webhooks: number;
      created_at: number;
      updated_at: number;
    };
  };
}

// ===== Resource Interfaces =====

// A generic Source resource (e.g., for gcash/grabpay authorization via source.chargeable)
export interface PayMongoSource {
  id: string;
  type: 'source';
  attributes: {
    amount: number;
    currency: string;
    type?: string;
    status: string;
    redirect?: {
      checkout_url: string;
      failed: string;
      success: string;
    };
    [key: string]: unknown;
  };
}

// The Payment resource (used across many event types)
export interface PayMongoPayment {
  id: string;
  type: 'payment';
  attributes: {
    amount: number;
    currency: string;
    status: string;
    billing?: {
      address?: Record<string, string | null>;
      email?: string | null;
      name?: string | null;
      phone?: string | null;
    };
    payment_intent_id?: string | null;
    source?: PayMongoSource;
    net_amount?: number;
    fee?: number;
    taxes?: Array<{ amount: number; currency: string }>;
    metadata?: CustomMetadata;
    [key: string]: unknown;
  };
}

// Checkout Session resource (for checkout_session.payment.paid)
export interface PayMongoCheckoutSession {
  id: string;
  type: 'checkout_session';
  attributes: {
    checkout_url: string;
    payments?: PayMongoPayment[];
    payment_intent?: {
      id: string;
      type: 'payment_intent';
      attributes: Record<string, unknown>;
    };
    status: string;
    metadata?: Record<string, string>;
    [key: string]: unknown;
  };
}

// Link Payment resource (for link.payment.paid events)
export interface PayMongoLink {
  id: string;
  type: 'link';
  attributes: {
    amount: number;
    currency: string;
    status: string;
    checkout_url: string;
    reference_number?: string;
    payments?: PayMongoPayment[];
    [key: string]: unknown;
  };
}

// QR PH expiration event—could include metadata about QR code status
export interface PayMongoQRPh {
  id: string;
  type: 'qrph';
  attributes: {
    // structure may vary; using placeholders
    status: string;
    [key: string]: unknown;
  };
}

// Refund update events may reference payment refunds; using same as Payment
// If PayMongo defines a separate Refund object in actual documentation, replace accordingly
export type PayMongoRefund = PayMongoPayment;

// ===== Discriminated Union of Webhook Event Types =====

export type PayMongoWebhookEvent =
  | PayMongoWebhookBase<'source.chargeable', PayMongoSource>
  | PayMongoWebhookBase<'payment.paid', PayMongoPayment>
  | PayMongoWebhookBase<'payment.failed', PayMongoPayment>
  | PayMongoWebhookBase<'payment.refunded', PayMongoRefund>
  | PayMongoWebhookBase<'payment.refund.updated', PayMongoRefund>
  | PayMongoWebhookBase<
      'checkout_session.payment.paid',
      PayMongoCheckoutSession
    >
  | PayMongoWebhookBase<'link.payment.paid', PayMongoLink>
  | PayMongoWebhookBase<'qrph.expired', PayMongoQRPh>;
