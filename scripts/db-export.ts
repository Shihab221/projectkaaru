/**
 * Export all app tables to JSON (no pg_dump required).
 * Usage: npm run db:export
 * Requires DATABASE_URL in .env
 */
import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";

const TABLES = [
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

function serializeRow(table: string, row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (value === null || value === undefined) {
      out[key] = null;
      continue;
    }
    if (value instanceof Date) {
      out[key] = value.toISOString();
      continue;
    }
    if (Buffer.isBuffer(value)) {
      out[key] = { __type: "base64", data: value.toString("base64") };
      continue;
    }
    if (Array.isArray(value)) {
      out[key] = value;
      continue;
    }
    out[key] = value;
  }
  return out;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Add it to .env");
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : undefined,
  });

  console.log("Connecting to database...");
  await client.connect();
  console.log("Connected.\n");

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outDir = path.join(process.cwd(), "prisma", "backups", stamp);
  fs.mkdirSync(outDir, { recursive: true });

  const manifest: Record<string, number> = {};

  for (const table of TABLES) {
    process.stdout.write(`Exporting ${table}... `);
    const { rows } = await client.query(`SELECT * FROM "${table}"`);
    const serialized = rows.map((r) =>
      serializeRow(table, r as Record<string, unknown>)
    );
    fs.writeFileSync(
      path.join(outDir, `${table}.json`),
      JSON.stringify(serialized, null, 2)
    );
    manifest[table] = serialized.length;
    console.log(`${serialized.length} rows`);
  }

  fs.writeFileSync(
    path.join(outDir, "manifest.json"),
    JSON.stringify({ exportedAt: new Date().toISOString(), tables: manifest }, null, 2)
  );

  await client.end();
  console.log(`\nDone. Backup folder:\n  ${outDir}`);
}

main().catch((err) => {
  console.error("\nExport failed:", err.message || err);
  process.exit(1);
});
