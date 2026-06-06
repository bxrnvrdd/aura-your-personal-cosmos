import Holidays from "date-holidays";

// Flag emoji from ISO-2 country code
function flagOf(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "🌐";
  const A = 0x1f1e6;
  return String.fromCodePoint(A + code.charCodeAt(0) - 65, A + code.charCodeAt(1) - 65);
}

export type Country = { code: string; name: string; flag: string };

function build(): Country[] {
  try {
    const hd = new Holidays();
    const raw = hd.getCountries() as Record<string, string>;
    return Object.entries(raw)
      .map(([code, name]) => ({ code, name, flag: flagOf(code) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [{ code: "US", name: "United States", flag: "🇺🇸" }];
  }
}

export const COUNTRIES: Country[] = build();
