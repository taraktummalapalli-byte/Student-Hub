import { Router, type IRouter } from "express";
import { eq, and, desc, ilike } from "drizzle-orm";
import { db, itemsTable, usersTable } from "@workspace/db";
import {
  ListItemsQueryParams,
  CreateItemBody,
  GetItemParams,
  UpdateItemParams,
  UpdateItemBody,
  DeleteItemParams,
} from "@workspace/api-zod";
import { authMiddleware } from "../middlewares/auth";

const router: IRouter = Router();

// Helper: build item-with-userName select shape
const itemSelect = {
  id: itemsTable.id,
  title: itemsTable.title,
  description: itemsTable.description,
  category: itemsTable.category,
  type: itemsTable.type,
  location: itemsTable.location,
  date: itemsTable.date,
  image: itemsTable.image,
  contact: itemsTable.contact,
  userId: itemsTable.userId,
  createdAt: itemsTable.createdAt,
  userName: usersTable.name,
};

// GET /items
router.get("/items", async (req, res): Promise<void> => {
  const parsed = ListItemsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { search, category, type, limit = 50, offset = 0 } = parsed.data;

  const conditions = [];
  if (search) conditions.push(ilike(itemsTable.title, `%${search}%`));
  if (category) conditions.push(eq(itemsTable.category, category));
  if (type) conditions.push(eq(itemsTable.type, type));

  const items = await db
    .select(itemSelect)
    .from(itemsTable)
    .innerJoin(usersTable, eq(itemsTable.userId, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(itemsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json(items);
});

// GET /items/:id
router.get("/items/:id", async (req, res): Promise<void> => {
  const params = GetItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db
    .select(itemSelect)
    .from(itemsTable)
    .innerJoin(usersTable, eq(itemsTable.userId, usersTable.id))
    .where(eq(itemsTable.id, params.data.id));

  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.json(item);
});

// POST /items (protected)
router.post("/items", authMiddleware, async (req, res): Promise<void> => {
  const parsed = CreateItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = res.locals["userId"] as number;

  const [inserted] = await db
    .insert(itemsTable)
    .values({ ...parsed.data, userId })
    .returning();

  // Fetch with userName
  const [item] = await db
    .select(itemSelect)
    .from(itemsTable)
    .innerJoin(usersTable, eq(itemsTable.userId, usersTable.id))
    .where(eq(itemsTable.id, inserted.id));

  res.status(201).json(item);
});

// PUT /items/:id (protected, owner only)
router.put("/items/:id", authMiddleware, async (req, res): Promise<void> => {
  const params = UpdateItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = res.locals["userId"] as number;
  const userRole = res.locals["userRole"] as string;

  const [existing] = await db
    .select({ userId: itemsTable.userId })
    .from(itemsTable)
    .where(eq(itemsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  if (existing.userId !== userId && userRole !== "admin") {
    res.status(403).json({ error: "Forbidden: You do not own this item" });
    return;
  }

  await db
    .update(itemsTable)
    .set(parsed.data)
    .where(eq(itemsTable.id, params.data.id));

  const [item] = await db
    .select(itemSelect)
    .from(itemsTable)
    .innerJoin(usersTable, eq(itemsTable.userId, usersTable.id))
    .where(eq(itemsTable.id, params.data.id));

  res.json(item);
});

// DELETE /items/:id (protected, owner or admin)
router.delete("/items/:id", authMiddleware, async (req, res): Promise<void> => {
  const params = DeleteItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = res.locals["userId"] as number;
  const userRole = res.locals["userRole"] as string;

  const [existing] = await db
    .select({ userId: itemsTable.userId })
    .from(itemsTable)
    .where(eq(itemsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  if (existing.userId !== userId && userRole !== "admin") {
    res.status(403).json({ error: "Forbidden: You do not own this item" });
    return;
  }

  await db.delete(itemsTable).where(eq(itemsTable.id, params.data.id));

  res.sendStatus(204);
});

export default router;
