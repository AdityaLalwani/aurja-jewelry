#!/usr/bin/env node

const SWELL_API_URL = "https://api.swell.store";
const PAGE_SIZE = 100;

function parseArgs(args) {
  const mappingIndex = args.indexOf("--mapping");
  const mappingPath = mappingIndex >= 0 ? args[mappingIndex + 1] : undefined;
  if (!mappingPath || mappingPath.startsWith("--")) {
    throw new Error(
      "Usage: node --env-file=.env.local scripts/migrate-images-to-imagekit.js --mapping <mapping.json> [--apply]",
    );
  }
  return { mappingPath, apply: args.includes("--apply") };
}

function getCredentials() {
  const storeId = process.env.SWELL_STORE_ID;
  const secretKey = process.env.SWELL_SECRET_KEY;
  const endpointValue = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  if (!storeId || !secretKey || !endpointValue) {
    throw new Error(
      "Set SWELL_STORE_ID, SWELL_SECRET_KEY, and NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT.",
    );
  }
  return {
    storeId,
    secretKey,
    endpoint: new URL(endpointValue),
  };
}

function validateMapping(mapping, endpoint) {
  if (!mapping || typeof mapping !== "object" || Array.isArray(mapping)) {
    throw new Error("Mapping must be a JSON object keyed by product ID or SKU.");
  }
  for (const [key, urls] of Object.entries(mapping)) {
    if (!Array.isArray(urls) || urls.length === 0) {
      throw new Error(`Mapping entry ${key} must contain a non-empty URL list.`);
    }
    for (const value of urls) {
      let url;
      try {
        url = new URL(value);
      } catch {
        throw new Error(`Mapping entry ${key} contains an invalid URL.`);
      }
      const basePath = endpoint.pathname.endsWith("/")
        ? endpoint.pathname
        : `${endpoint.pathname}/`;
      if (url.origin !== endpoint.origin || !url.pathname.startsWith(basePath)) {
        throw new Error(
          `Mapping entry ${key} contains a URL outside the ImageKit endpoint.`,
        );
      }
    }
  }
}

async function swellRequest(path, credentials, options = {}) {
  const authorization = Buffer.from(
    `${credentials.storeId}:${credentials.secretKey}`,
  ).toString("base64");
  const response = await fetch(`${SWELL_API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${authorization}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Swell API returned ${response.status}: ${responseText}`);
  }
  return responseText ? JSON.parse(responseText) : null;
}

async function listProducts(credentials) {
  const products = [];
  for (let page = 1; ; page += 1) {
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      page: String(page),
    });
    const result = await swellRequest(`/products?${params}`, credentials);
    if (!result || !Array.isArray(result.results)) {
      throw new Error("Unexpected products response from Swell.");
    }
    products.push(...result.results);
    if (products.length >= result.count || result.results.length === 0) break;
  }
  return products;
}

async function main() {
  const { mappingPath, apply } = parseArgs(process.argv.slice(2));
  const credentials = getCredentials();
  const { readFile } = await import("node:fs/promises");
  const mapping = JSON.parse(await readFile(mappingPath, "utf8"));
  validateMapping(mapping, credentials.endpoint);

  const products = await listProducts(credentials);
  let matched = 0;
  for (const product of products) {
    const urls =
      mapping[product.id] ?? (product.sku ? mapping[product.sku] : undefined);
    if (!urls) continue;
    matched += 1;
    const oldUrls = (product.images ?? [])
      .map((image) => image.file?.url)
      .filter(Boolean);
    console.log(
      `Product ID: ${product.id} | Old URL: ${oldUrls.join(", ") || "(none)"} | Proposed ImageKit URL: ${urls.join(", ")}`,
    );

    if (apply) {
      await swellRequest(
        `/products/${encodeURIComponent(product.id)}`,
        credentials,
        {
          method: "PUT",
          body: JSON.stringify({
            content: {
              ...(product.content ?? {}),
              imagekit_urls: { urls },
            },
          }),
        },
      );
      console.log(`Applied image URL references for product ${product.id}.`);
    }
  }

  console.log(
    `${apply ? "Apply" : "Dry run"} complete: ${matched} mapped product(s) of ${products.length}. ${apply ? "Swell files were not deleted." : "No Swell products were changed."}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
