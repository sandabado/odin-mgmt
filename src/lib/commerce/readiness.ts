import "server-only";

export const commerceModes = ["off", "test", "live"] as const;

export type CommerceMode = (typeof commerceModes)[number];
export type CommerceReadinessState =
  | "disabled"
  | "configuration-incomplete"
  | "test-scaffold"
  | "live-blocked";
export type CommerceConfigurationKey =
  | "STRIPE_SECRET_KEY"
  | "STRIPE_WEBHOOK_SECRET"
  | "SUPABASE_SERVICE_ROLE_KEY";

export interface CommerceReadiness {
  checkoutEnabled: boolean;
  configuredForServerIntegration: boolean;
  missingConfiguration: CommerceConfigurationKey[];
  mode: CommerceMode;
  publicSalesEnabled: boolean;
  state: CommerceReadinessState;
}

function commerceMode(value: string | undefined): CommerceMode {
  return commerceModes.includes(value as CommerceMode)
    ? (value as CommerceMode)
    : "off";
}

/**
 * Commerce remains fail-closed until products, order persistence, webhook
 * idempotency, fulfillment, and an explicit production approval gate exist.
 * Environment variables alone can never make checkout public.
 */
export function getCommerceReadiness(): CommerceReadiness {
  const mode = commerceMode(process.env.COMMERCE_MODE);
  const requirements: Array<[CommerceConfigurationKey, string | undefined]> = [
    ["STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY],
    ["STRIPE_WEBHOOK_SECRET", process.env.STRIPE_WEBHOOK_SECRET],
    ["SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY],
  ];
  const missingConfiguration = requirements
    .filter(([, value]) => !value?.trim())
    .map(([key]) => key);
  const configuredForServerIntegration = missingConfiguration.length === 0;

  let state: CommerceReadinessState = "disabled";
  if (mode !== "off" && !configuredForServerIntegration) {
    state = "configuration-incomplete";
  } else if (mode === "test") {
    state = "test-scaffold";
  } else if (mode === "live") {
    state = "live-blocked";
  }

  return {
    checkoutEnabled: false,
    configuredForServerIntegration,
    missingConfiguration,
    mode,
    publicSalesEnabled: false,
    state,
  };
}
