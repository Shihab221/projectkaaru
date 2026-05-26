/**
 * Import JSON backup into DATABASE_URL (e.g. new VPS Postgres).
 * Usage: npm run db:import -- prisma/backups/2025-01-01T12-00-00
 */
import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";

const IMPORT_ORDER = [
  "users",
  "addresses",
  "categories",
  "products",
  "product_sizes",
  "product_images",
  "reviews",
  "orders",
  "shipping_addresses",
  "order_items",
  "tutorials",
] as const;

function deserializeValue(value: unknown): unknown {
  if (
    value &&
    typeof value === "object" &&
    "__type" in value &&
    (value as { __type: string }).__type === "base64" &&
    "data" in value
  ) {
    return Buffer.from((value as { data: string }).data, "base64");
  }
  return value;
}

function rowToColumns(row: Record<string, unknown>) {
  const keys = Object.keys(row);
  const values = keys.map((k) => deserializeValue(row[k]));
  const placeholders = keys.map((_, i) => `$${i + 1}`);
  const quoted = keys.map((k) => `"${k}"`).join(", ");
  return { quoted, placeholders: placeholders.join(", "), values, keys };
}

async function main() {
  const backupDir = process.argv[2];
  if (!backupDir) {
    console.error(
      "Usage: npm run db:import -- prisma/backups/<folder-name>"
    );
    process.exit(1);
  }

  const resolved = path.resolve(process.cwd(), backupDir);
  if (!fs.existsSync(resolved)) {
    console.error("Backup folder not found:", resolved);
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : undefined,
  });

  await client.connect();
  console.log("Connected. Truncating tables (CASCADE)...");
  await client.query(`
    TRUNCATE TABLE
      order_items,
      shipping_addresses,
      orders,
      reviews,
      product_images,
      product_sizes,
      products,
      tutorials,
      categories,
      addresses,
      users
    RESTART IDENTITY CASCADE;
  `);

  for (const table of IMPORT_ORDER) {
    const file = path.join(resolved, `${table}.json`);
    if (!fs.existsSync(file)) {
      console.log(`Skip ${table} (no file)`);
      continue;
    }
    const rows = JSON.parse(fs.readFileSync(file, "utf8")) as Record<
      string,
      unknown
    >[];
    if (rows.length === 0) {
      console.log(`${table}: 0 rows`);
      continue;
    }
    let inserted = 0;
    for (const row of rows) {
      const { quoted, placeholders, values, keys } = rowToColumns(row);
      await client.query(
        `INSERT INTO "${table}" (${quoted}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
        values
      );
      inserted++;
    }
    console.log(`${table}: ${inserted} rows`);
  }

  await client.end();
  console.log("\nImport finished.");
}

main().catch((err) => {
  console.error("\nImport failed:", err.message || err);
  process.exit(1);
});
