import { access, readFile, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { validateBlockManifest, type BlockManifest } from "../../blocks/manifest.js";
import { validateBlockManifests } from "../../blocks/sync.js";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function collectManifestPaths(path: string): Promise<string[]> {
  let entries;

  try {
    entries = await readdir(path, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = join(path, entry.name);

    if (entry.isFile() && entry.name === "manifest.json") {
      files.push(entryPath);
    } else if (entry.isDirectory()) {
      files.push(...(await collectManifestPaths(entryPath)));
    }
  }

  return files;
}

export async function loadBlockManifests(path?: string, cwd = process.cwd()): Promise<BlockManifest[]> {
  const target = resolve(cwd, path ?? "blocks");
  let targetStats;

  try {
    targetStats = await stat(target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT" && path === undefined) return [];
    throw error;
  }

  const paths = (targetStats.isFile() ? [target] : await collectManifestPaths(target)).sort();

  if (paths.length === 0) {
    if (path !== undefined) throw new Error(`No manifest.json files found in ${target}.`);
    return [];
  }

  return Promise.all(
    paths.map(async (manifestPath) => {
      try {
        const source = await readFile(manifestPath, "utf8");
        return validateBlockManifest(JSON.parse(source));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`${manifestPath}: ${message}`);
      }
    }),
  );
}

export async function validateManifestPath(path?: string, cwd = process.cwd()): Promise<string[]> {
  const target = resolve(cwd, path ?? "blocks");
  const targetExists = await exists(target);

  if (!targetExists) {
    throw new Error(`Manifest path does not exist: ${target}`);
  }

  const manifests = await loadBlockManifests(path, cwd);

  if (manifests.length === 0) {
    throw new Error(`No block manifests found in ${target}.`);
  }

  return validateBlockManifests(manifests).map((manifest) => manifest.registry_identity);
}
