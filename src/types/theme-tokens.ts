/** Color token declarations are site-owned; values are editor-owned overrides. */
export type RadiusThemeTokenValue = "pill" | `${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32}px`;

export type ThemeTokenValue = `#${string}` | `palette:${string}` | RadiusThemeTokenValue;

export interface ColorThemeToken {
  label: string;
  type: "color";
  cssVariable: `--${string}`;
  default: `#${string}`;
}

export interface RadiusThemeToken {
  label: string;
  type: "radius";
  cssVariable: `--theme-radius-${string}`;
  default: RadiusThemeTokenValue;
}

export type ThemeTokenDeclarations = Readonly<Record<string, ColorThemeToken | RadiusThemeToken>>;

export interface WebsiteThemeTokens {
  tokens: ThemeTokenDeclarations;
  /** May contain overrides for declarations temporarily removed by a site. */
  values: Record<string, ThemeTokenValue>;
}

export interface ThemeTokensUpdate {
  tokens?: ThemeTokenDeclarations;
  values?: Record<string, ThemeTokenValue>;
}
