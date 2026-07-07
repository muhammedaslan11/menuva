export const themes = {
  paprika: { name: "Paprika", color: "#e8491f" },
  midnight: { name: "Gece Mavi", color: "#1a1a2e" },
  emerald: { name: "Zümrüt", color: "#3e7c4f" },
  sunflower: { name: "Ayçiçeği", color: "#f4d03f" },
  berry: { name: "Çilek", color: "#c2185b" },
  ocean: { name: "Okyanus", color: "#0277bd" },
  forest: { name: "Orman", color: "#1b5e20" },
  plum: { name: "Dut", color: "#6a1b9a" },
  copper: { name: "Bakır", color: "#bf360c" },
  slate: { name: "Arduvaz", color: "#455a64" },
} as const;

export type ThemeKey = keyof typeof themes;

export function getThemeColor(themeKey?: string | null): string {
  if (!themeKey || !(themeKey in themes)) return themes.paprika.color;
  return themes[themeKey as ThemeKey].color;
}

export function getThemeName(themeKey: string | null | undefined): string {
  if (!themeKey || !(themeKey in themes)) return themes.paprika.name;
  return themes[themeKey as ThemeKey].name;
}
