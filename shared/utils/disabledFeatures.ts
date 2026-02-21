type DisabledFeatures = {
  // disables email sending, put anything as RESEND_API_KEY
  "email": boolean;
  // disables logging, requests to log might still be fired, but you won't see anything in the logs
  "logs": boolean;
  // disables magic link login
  "magic-link": boolean;
  // disables github oauth login
  "oauth-github": boolean;
  // disables google oauth login
  "oauth-google": boolean;
  // disables turnstile widget altogether
  "turnstile": boolean;
}

// all features enabled by default
const DEFAULTS: DisabledFeatures = {
  "email": false,
  "logs": false,
  "magic-link": false,
  "oauth-github": false,
  "oauth-google": false,
  "turnstile": false,
}

export function disabledFeatures(): DisabledFeatures {
  const config = useRuntimeConfig()
  const env = config.public.disabledFeatures
  const features: DisabledFeatures = { ...DEFAULTS }

  if (!env) {
    return features
  }

  const disabled = new Set(env.split(",")
    .map((f) => f.trim())
    .filter(Boolean))

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  for (const feature of Object.keys(features) as Array<keyof DisabledFeatures>) {
    features[feature] = disabled.has(feature)
  }

  // oh yeah ? and how would this magic link be sent, huh ?
  if (!features["email"] && features["magic-link"]) {
    features["magic-link"] = false
  }

  return features
}

export function isFeatureDisabled(feature: keyof DisabledFeatures): boolean {
  return disabledFeatures()[feature]
}

export default disabledFeatures
