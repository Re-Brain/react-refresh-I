// Currencies the backend's fx-estimate endpoint (Frankfurter) supports, keyed
// by the two-letter country code an IP-geolocation lookup returns. Eurozone
// countries all map to EUR.
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  AU: 'AUD', BR: 'BRL', CA: 'CAD', CH: 'CHF', CN: 'CNY', CZ: 'CZK', DK: 'DKK',
  GB: 'GBP', HK: 'HKD', HU: 'HUF', ID: 'IDR', IL: 'ILS', IN: 'INR', IS: 'ISK',
  JP: 'JPY', KR: 'KRW', MX: 'MXN', MY: 'MYR', NO: 'NOK', NZ: 'NZD', PH: 'PHP',
  PL: 'PLN', RO: 'RON', SE: 'SEK', SG: 'SGD', TH: 'THB', TR: 'TRY', US: 'USD',
  ZA: 'ZAR',
  // Eurozone
  AT: 'EUR', BE: 'EUR', CY: 'EUR', DE: 'EUR', EE: 'EUR', ES: 'EUR', FI: 'EUR',
  FR: 'EUR', GR: 'EUR', HR: 'EUR', IE: 'EUR', IT: 'EUR', LT: 'EUR', LU: 'EUR',
  LV: 'EUR', MT: 'EUR', NL: 'EUR', PT: 'EUR', SI: 'EUR', SK: 'EUR',
}

type IpLookupResponse = {
  success?: boolean
  country_code?: string
}

// Resolved once per page load and reused — a visitor's location doesn't
// change mid-session, so there's no reason to re-hit the geolocation API for
// every amount they type.
let cachedLookup: Promise<string | null> | null = null

// Best-effort guess at the visitor's local currency from their IP address
// (not their browser/OS language, which often doesn't match where someone
// actually is — e.g. a traveler whose OS is still set to their home locale),
// for the donation form's "≈ $X (estimated)" display. Never throws; resolves
// to null on any failure, an unsupported currency, or JPY (the real amount is
// already in yen, so an "estimate" would be redundant). A null result means
// the estimate feature simply doesn't show for this visitor.
export function detectVisitorCurrency(): Promise<string | null> {
  if (!cachedLookup) {
    cachedLookup = fetch('https://ipwho.is/')
      .then(res => (res.ok ? (res.json() as Promise<IpLookupResponse>) : null))
      .then(data => {
        if (!data?.success || !data.country_code) return null
        const currency = COUNTRY_TO_CURRENCY[data.country_code]
        if (!currency || currency === 'JPY') return null
        return currency
      })
      .catch(() => null)
  }
  return cachedLookup
}
