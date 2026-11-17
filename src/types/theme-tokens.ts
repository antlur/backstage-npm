/** Color token declarations are site-owned; values are editor-owned overrides. */
export type ThemeTokenValue = `#${string}` | `palette:${string}`;

export interface ColorThemeToken {
  label: string;
  type: "color";
  cssVariable: `--${string}`;
  default: `#${string}`;
}

export type ThemeTokenDeclarations = Readonly<Record<string, ColorThemeToken>>;

export interface WebsiteThemeTokens {
  tokens: ThemeTokenDeclarations;
  /** May contain overrides for declarations temporarily removed by a site. */
  values: Record<string, ThemeTokenValue>;
}

export interface ThemeTokensUpdate {
  tokens?: ThemeTokenDeclarations;
  values?: Record<string, ThemeTokenValue>;
}
