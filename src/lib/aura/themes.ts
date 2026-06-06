export type ThemeId = "purple" | "chronos" | "abyss" | "petrichor";

export const THEMES: {
  id: ThemeId;
  name: string;
  description: string;
  font: string;
  swatch: string;
}[] = [
  { id: "purple", name: "Purple Aurora", description: "Cabinet Grotesk", font: "Cabinet Grotesk", swatch: "#a78bfa" },
  { id: "chronos", name: "Chronos Blue", description: "Plus Jakarta Sans", font: "Plus Jakarta Sans", swatch: "#3b82f6" },
  { id: "abyss", name: "Deep Abyss", description: "JetBrains Mono", font: "JetBrains Mono", swatch: "#ffffff" },
  { id: "petrichor", name: "Petrichor Gray", description: "DM Serif Display", font: "DM Serif Display", swatch: "#9ca3af" },
];

export const THEME_CLASS: Record<ThemeId, string> = {
  purple: "theme-purple",
  chronos: "theme-chronos",
  abyss: "theme-abyss",
  petrichor: "theme-petrichor",
};
