import type { ColorThemeToken, ThemeTokenDeclarations } from "../types/theme-tokens.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Match the deployed website API's color-only declaration contract. */
export function validateThemeTokenDeclarations(value: unknown): ThemeTokenDeclarations {
  if (!isRecord(value)) throw new Error("Theme token declarations must be an object.");
  if (Object.keys(value).length > 128) throw new Error("A site can declare at most 128 theme tokens.");

  const tokens: Record<string, ColorThemeToken> = {};
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
    if (token.type !== "color") fail("only color tokens are supported.");
    if (typeof token.cssVariable !== "string" || !/^--[a-z][a-z0-9-]{0,80}$/.test(token.cssVariable.trim())) {
      fail("invalid CSS variable.");
    }
    if (typeof token.default !== "string" || !/^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/i.test(token.default.trim())) {
      fail("default must be a #RGB or #RRGGBB color.");
    }
    let hex = (token.default as string).trim().toUpperCase();
    if (hex.length === 4) hex = "#" + [...hex.slice(1)].map((digit) => digit + digit).join("");
    tokens[key] = {
      label: (token.label as string).trim(),
      type: "color",
      cssVariable: (token.cssVariable as string).trim() as `--${string}`,
      default: hex as `#${string}`,
    };
  }
  return tokens;
}
