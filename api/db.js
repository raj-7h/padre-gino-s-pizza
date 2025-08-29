import { AsyncDatabase } from "promised-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

export async function getDb() {
  if (!db) {
    // now points to pizza.sqlite inside api/
    db = await AsyncDatabase.open(path.join(__dirname, "pizza.sqlite"));
  }
  return db;
}
