import type Database from "better-sqlite3";
import type { Category } from "@/lib/types/entities";

interface CategoryRow {
  id: string;
  name: string;
  color: string;
}

function rowToCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name, color: row.color };
}

export async function listCategories(
  db: Database.Database
): Promise<Category[]> {
  const rows = db
    .prepare("SELECT id, name, color FROM categories ORDER BY name ASC")
    .all() as CategoryRow[];
  return rows.map(rowToCategory);
}

export async function insertCategory(
  db: Database.Database,
  category: Category
): Promise<Category> {
  db.prepare(
    "INSERT INTO categories (id, name, color) VALUES (?, ?, ?)"
  ).run(category.id, category.name, category.color);
  return category;
}

export async function getCategoryById(
  db: Database.Database,
  id: string
): Promise<Category | null> {
  const row = db
    .prepare("SELECT id, name, color FROM categories WHERE id = ?")
    .get(id) as CategoryRow | undefined;
  return row ? rowToCategory(row) : null;
}
