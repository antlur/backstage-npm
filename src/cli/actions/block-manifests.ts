import { access, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import type { BlockManifest } from "../../blocks/manifest.js";
import { parseBlockIdentity } from "../../blocks/manifest.js";
import {
  getRegistryBlock,
  listRegistryBlocks,
  searchRegistryBlocks,
  validateBlockManifest,
} from "../../blocks/registry.js";
import { astroRendererFileName, createAstroRendererScaffold } from "../../blocks/scaffold.js";

const BLOCK_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function writeBlockFiles(manifest: BlockManifest, cwd: string): Promise<string> {
  const directory = resolve(cwd, "blocks", manifest.slug);
  const manifestPath = join(directory, "manifest.json");
  const rendererFileName = astroRendererFileName(manifest.slug);
  const rendererPath = join(directory, rendererFileName);

  if ((await exists(manifestPath)) || (await exists(rendererPath))) {
    throw new Error("Refusing to overwrite " + directory + "; manifest.json or " + rendererFileName + " already exists.");
  }

  await mkdir(dirname(directory), { recursive: true });
  await mkdir(directory, { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });
  await writeFile(rendererPath, createAstroRendererScaffold(manifest), { flag: "wx" });
  return directory;
}

export function formatRegistryBlock(manifest: BlockManifest): string {
  return `${manifest.registry_identity}  ${manifest.name}${manifest.description ? ` - ${manifest.description}` : ""}`;
}

export function listBlocks(): string[] {
  return listRegistryBlocks().map(formatRegistryBlock);
}

export function searchBlocks(query: string): string[] {
  return searchRegistryBlocks(query).map(formatRegistryBlock);
}

export async function installBlock(identity: string, cwd = process.cwd()): Promise<string> {
  const manifest = validateBlockManifest(getRegistryBlock(identity));
  return writeBlockFiles(manifest, cwd);
}

export async function forkBlock(
  identity: string,
  namespace: string,
  slug = `${namespace}-${parseBlockIdentity(identity).key}`,
  cwd = process.cwd(),
): Promise<string> {
  const source = getRegistryBlock(identity);
  const sourceIdentity = parseBlockIdentity(source.registry_identity);
  const forkIdentity = `${namespace}:${sourceIdentity.key}@${sourceIdentity.version}`;
  parseBlockIdentity(forkIdentity);

  if (namespace === sourceIdentity.namespace) {
    throw new Error(`Choose a namespace other than "${namespace}" when forking ${identity}.`);
  }

  if (!BLOCK_SLUG_PATTERN.test(slug)) {
    throw new Error("Block slug must use lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen.");
  }

  const manifest = validateBlockManifest({
    ...source,
    slug,
    registry_identity: forkIdentity,
    derived_from: source.registry_identity,
  });

  return writeBlockFiles(manifest, cwd);
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

  const identities = new Set<string>();
  const slugs = new Set<string>();

  for (const manifest of manifests) {
    if (identities.has(manifest.registry_identity)) {
      throw new Error(`Multiple local manifests use identity ${manifest.registry_identity}.`);
    }
    identities.add(manifest.registry_identity);

    if (slugs.has(manifest.slug)) {
      throw new Error(`Multiple local manifests use slug "${manifest.slug}".`);
    }
    slugs.add(manifest.slug);
  }

  return manifests.map((manifest) => manifest.registry_identity);
}
