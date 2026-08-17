import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

// Side-effect module: must run before anything reads process.env.
// Most specific first; dotenv keeps the first value it sees for a given key.
const envFiles = [".env.development.local", ".env.local", ".env.development", ".env"]
  .map((file) => resolve(process.cwd(), file))
  .filter((file) => existsSync(file));

if (envFiles.length > 0) {
  config({ path: envFiles });
}
