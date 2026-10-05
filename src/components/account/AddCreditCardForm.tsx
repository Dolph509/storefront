"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SettingsAlert } from "@/components/account/SettingsSection";
import { Button } from "@/components/ui/button";
import {
  completePaymentSetupSession,
  createPaymentSetupSession,
  resolveSetupPaymentMethodId,
} from "@/lib/data/payment-setup";
import { isStripeConfigured, stripePromise } from "@/lib/utils/stripe";

function SetupCardInner({
  sessionId,
  onComplete,
}: {
  sessionId: string;
  onComplete: () => void;
}) {
  const t = useTranslations("creditCards");
  const stripe = useStripe();
  const elements = useElements();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!stripe || !elements) return;
    setError(null);
    setSaving(true);
    try {
      const confirmed = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
      });
      if (confirmed.error) {
        throw new Error(confirmed.error.message || t("addCardFailed"));
      }
      const result = await completePaymentSetupSession(sessionId);
      if (!result.success) {
        throw new Error(result.error || t("addCardFailed"));
      }
      toast.success(t("cardAdded"));
      onComplete();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("addCardFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-4">
      <PaymentElement />
      {error ? <SettingsAlert>{error}</SettingsAlert> : null}
      <Button type="submit" disabled={saving || !stripe || !elements}>
        {saving ? t("savingCard") : t("saveCard")}
      </Button>
    </form>
  );
}

export function AddCreditCardForm({ onAdded }: { onAdded: () => void }) {
  const t = useTranslations("creditCards");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isStripeConfigured) setUnavailable(true);
  }, []);

  async function startSetup() {
    setError(null);
    setLoading(true);
    try {
      const paymentMethodId = await resolveSetupPaymentMethodId();
      if (!paymentMethodId) {
        setUnavailable(true);
        return;
      }
      const result = await createPaymentSetupSession(paymentMethodId);
      if (!result.success) {
        throw new Error(result.error || t("addCardFailed"));
      }
      if (!result.session) {
        throw new Error(t("addCardFailed"));
      }
      const secret = result.session.external_client_secret;
      if (!secret) throw new Error(t("addCardFailed"));
      setSessionId(result.session.id);
      setClientSecret(secret);
      setOpen(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("addCardFailed"));
    } finally {
      setLoading(false);
    }
  }

  if (unavailable) {
    return (
      <p className="text-sm text-marketplace-muted-foreground">
        {t("addCardUnavailable")}
      </p>
    );
  }

  if (!open || !clientSecret || !sessionId) {
    return (
      <div className="space-y-3">
        {error ? <SettingsAlert>{error}</SettingsAlert> : null}
        <Button
          type="button"
          onClick={() => void startSetup()}
          disabled={loading}
        >
          {loading ? t("startingCardSetup") : t("addCard")}
        </Button>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance: { theme: "stripe" } }}
    >
      <SetupCardInner
        sessionId={sessionId}
        onComplete={() => {
          setOpen(false);
          setClientSecret(null);
          setSessionId(null);
          onAdded();
        }}
      />
    </Elements>
  );
}
