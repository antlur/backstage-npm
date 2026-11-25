import type { ColorThemeToken, RadiusThemeToken, RadiusThemeTokenValue, ThemeTokenDeclarations } from "../types/theme-tokens.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const CSS_VARIABLE_PATTERN = /^--[a-z][a-z0-9-]{0,80}$/;
const RADIUS_CSS_VARIABLE_PATTERN = /^--theme-radius-[a-z][a-z0-9-]*$/;
const RADIUS_VALUE_PATTERN = /^(?:pill|(?:[0-9]|[12][0-9]|3[0-2])px)$/;

/** Normalize the canonical radius values accepted by the website theme-token API. */
export function normalizeThemeRadius(value: unknown): RadiusThemeTokenValue | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return RADIUS_VALUE_PATTERN.test(normalized) ? normalized as RadiusThemeTokenValue : null;
}

/** Match the deployed website API's color and radius declaration contract. */
export function validateThemeTokenDeclarations(value: unknown): ThemeTokenDeclarations {
  if (!isRecord(value)) throw new Error("Theme token declarations must be an object.");
  if (Object.keys(value).length > 128) throw new Error("A site can declare at most 128 theme tokens.");

  const tokens: Record<string, ColorThemeToken | RadiusThemeToken> = {};
  for (const [key, token] of Object.entries(value)) {
    function fail(message: string): never { throw new Error(`Theme token ${key}: ${message}`); }
    if (!/^[a-z][a-z0-9_-]{0,63}$/.test(key)) fail("invalid token key.");
    if (!isRecord(token)) fail("declaration must be an object.");
    if (Object.keys(token).some((field) => !["label", "type", "cssVariable", "default"].includes(field))) {
      fail("only label, type, cssVariable, and default are supported.");
    }
    if (typeof token.label !== "string" || !token.label.trim() || Array.from(token.label.trim()).length > 120) {
      fail("label must contain 1–120 characters.");
    }
    if (token.type !== "color" && token.type !== "radius") fail("type must be color or radius.");
    const cssVariable = typeof token.cssVariable === "string" ? token.cssVariable.trim() : null;
    if (cssVariable === null || !CSS_VARIABLE_PATTERN.test(cssVariable)
      || (token.type === "radius" && !RADIUS_CSS_VARIABLE_PATTERN.test(cssVariable))) {
      fail("invalid CSS variable.");
    }
    if (token.type === "radius") {
      const radius = normalizeThemeRadius(token.default);
      if (radius === null) fail("default must be pill or 0px-32px.");
      tokens[key] = {
        label: (token.label as string).trim(),
        type: "radius",
        cssVariable: cssVariable as `--theme-radius-${string}`,
        default: radius,
      };
      continue;
    }
    if (typeof token.default !== "string" || !/^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/i.test(token.default.trim())) {
      fail("default must be a #RGB or #RRGGBB color.");
    }
    let hex = (token.default as string).trim().toUpperCase();
    if (hex.length === 4) hex = "#" + [...hex.slice(1)].map((digit) => digit + digit).join("");
    tokens[key] = {
      label: (token.label as string).trim(),
      type: "color",
      cssVariable: cssVariable as `--${string}`,
      default: hex as `#${string}`,
    };
  }
  return tokens;
}
