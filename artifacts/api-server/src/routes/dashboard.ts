import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, itemsTable, usersTable } from "@workspace/db";
import { authMiddleware } from "../middlewares/auth";

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

// GET /dashboard (protected)
router.get("/dashboard", authMiddleware, async (req, res): Promise<void> => {
  const userId = res.locals["userId"] as number;

  const items = await db
    .select(itemSelect)
    .from(itemsTable)
    .innerJoin(usersTable, eq(itemsTable.userId, usersTable.id))
    .where(eq(itemsTable.userId, userId))
    .orderBy(desc(itemsTable.createdAt));

  const totalLost = items.filter((i) => i.type === "Lost").length;
  const totalFound = items.filter((i) => i.type === "Found").length;

  res.json({ items, totalLost, totalFound });
});

export default router;
