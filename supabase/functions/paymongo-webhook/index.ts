import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Buffer } from "node:buffer";
import crypto from "node:crypto";
import { PayMongoWebhookEvent } from "./paymongo-types.ts";
import { Database } from "../../database.types.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const webhookSecret = Deno.env.get("PAYMONGO_WEBHOOK_SECRET")!;

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

Deno.serve(async (req) => {
  const body = (await req.json()) as PayMongoWebhookEvent;
  const signature = req.headers.get("paymongo-signature")!;

  const isValid = verifySignature(body, signature, webhookSecret);

  if (!isValid) return new Response(JSON.stringify({ received: true }));

  const event = body.data;

  switch (event.attributes.type) {
    case "payment.paid": {
      const data = event.attributes.data.attributes;

      if (!data.metadata?.billId)
        return new Response(JSON.stringify({ received: true }));

      supabase.from("BillPayment").insert({
        id: crypto.randomUUID(),
        billId: data.metadata?.billId,
        amountPaid: data.amount,
        notes: "Doggy",
        paymentType: "Doggy",
        paymongoData: JSON.stringify(body),
        paymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      break;
    }
    case "payment.failed": {
      console.log("FAILED!");
      break;
    }
    default: {
      console.log("DEFAULT!");
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }));
});

const verifySignature = (
  body: PayMongoWebhookEvent,
  signatureHeader: string,
  secret: string
): boolean => {
  try {
    const parts = signatureHeader
      .split(",")
      .reduce((acc: Record<PropertyKey, string>, part) => {
        const [key, value] = part.split("=");
        acc[key] = value;
        return acc;
      }, {});

    const timestamp = parts["t"];
    const testSig = parts["te"];
    const liveSig = parts["li"];

    if (!timestamp || (!testSig && !liveSig)) {
      console.error("Invalid PayMongo signature header format");
      return false;
    }

    const expectedSig = liveSig || testSig;

    // Use the original JSON string
    const rawJson = JSON.stringify(body);

    // Concatenate timestamp + "." + payload
    const signedPayload = `${timestamp}.${rawJson}`;

    // Compute the HMAC
    const computedSig = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(expectedSig, "utf8"),
      Buffer.from(computedSig, "utf8")
    );
  } catch (err) {
    console.error(`Error verifying signature: ${err}`);
    return false;
  }
};
