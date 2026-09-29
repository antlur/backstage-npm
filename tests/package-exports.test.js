import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8"));

function assertTargetExists(target) {
  assert.ok(existsSync(path.join(packageRoot, target)), `Expected package target ${target} to exist`);
}

test("public package type declarations match the TypeScript build output", () => {
  assert.equal(packageJson.types, "./dist/index.d.ts");

  for (const [subpath, expected] of Object.entries({
    ".": { types: "./dist/index.d.ts", import: "./dist/index.js" },
    "./types": { types: "./dist/types/index.d.ts", import: "./dist/types/index.js" },
    "./studio": { types: "./dist/studio/index.d.ts", import: "./dist/studio/index.js" },
    "./config": { types: "./dist/config.d.ts", import: "./dist/config.js" },
  })) {
    const actual = packageJson.exports[subpath];
    assert.deepEqual(actual, expected, `Unexpected export targets for ${subpath}`);
    assertTargetExists(actual.types);
    assertTargetExists(actual.import);
  }

  const wildcard = packageJson.exports["./*"];
  for (const subpath of ["blocks/manifest", "endpoints/pages", "studio/types/block", "types/account-block"]) {
    assertTargetExists(wildcard.types.replace("*", subpath));
    assertTargetExists(wildcard.import.replace("*", subpath));
  }
});
