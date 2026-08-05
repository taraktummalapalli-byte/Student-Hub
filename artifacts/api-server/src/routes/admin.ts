import { Router, type IRouter } from "express";
import { eq, desc, count } from "drizzle-orm";
import { db, itemsTable, usersTable } from "@workspace/db";
import { DeleteAdminItemParams } from "@workspace/api-zod";
import { adminMiddleware } from "../middlewares/auth";

const router: IRouter = Router();

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

// GET /admin/users (admin only)
router.get("/admin/users", adminMiddleware, async (_req, res): Promise<void> => {
  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));

  res.json(users);
});

// GET /admin/items (admin only)
router.get("/admin/items", adminMiddleware, async (_req, res): Promise<void> => {
  const items = await db
    .select(itemSelect)
    .from(itemsTable)
    .innerJoin(usersTable, eq(itemsTable.userId, usersTable.id))
    .orderBy(desc(itemsTable.createdAt));

  res.json(items);
});

// DELETE /admin/items/:id (admin only)
router.delete("/admin/items/:id", adminMiddleware, async (req, res): Promise<void> => {
  const params = DeleteAdminItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select({ id: itemsTable.id })
    .from(itemsTable)
    .where(eq(itemsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  await db.delete(itemsTable).where(eq(itemsTable.id, params.data.id));

  res.sendStatus(204);
});

// GET /admin/stats (admin only)
router.get("/admin/stats", adminMiddleware, async (_req, res): Promise<void> => {
  const [totalUsersRow] = await db.select({ count: count() }).from(usersTable);
  const [totalItemsRow] = await db.select({ count: count() }).from(itemsTable);
  const [lostRow] = await db
    .select({ count: count() })
    .from(itemsTable)
    .where(eq(itemsTable.type, "Lost"));
  const [foundRow] = await db
    .select({ count: count() })
    .from(itemsTable)
    .where(eq(itemsTable.type, "Found"));

  res.json({
    totalUsers: totalUsersRow?.count ?? 0,
    totalItems: totalItemsRow?.count ?? 0,
    totalLost: lostRow?.count ?? 0,
    totalFound: foundRow?.count ?? 0,
  });
});

export default router;
