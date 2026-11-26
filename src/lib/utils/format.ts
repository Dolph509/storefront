export function formatDate(
  dateString: string | null,
  fallback = "-",
  locale = "en-US",
): string {
  if (!dateString) return fallback;
  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Short date for shop review bylines, e.g. "Sep 20, 2026". */
export function formatShopReviewDate(
  dateString: string | null,
  locale = "en-US",
): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(
  dateString: string | null,
  locale = "en-US",
): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Compact timestamp for mobile message inbox rows. */
export function formatInboxTime(
  dateString: string | null,
  locale = "en-US",
): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / 86_400_000,
  );
  if (dayDiff === 0) {
    return date.toLocaleTimeString(locale, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (dayDiff === 1) {
    return date.toLocaleDateString(locale, { weekday: "short" });
  }
  if (dayDiff < 7) {
    return date.toLocaleDateString(locale, { weekday: "short" });
  }
  return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
}

export function getPaymentStatusColor(state: string | null): string {
  switch (state) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "balance_due":
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
    case "void":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getFulfillmentStatusColor(state: string | null): string {
  switch (state) {
    case "shipped":
    case "delivered":
      return "bg-green-100 text-green-800";
    case "ready":
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "canceled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
