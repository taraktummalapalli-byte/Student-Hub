import { Router, type IRouter } from "express";
import { eq, desc, count } from "drizzle-orm";
import { db, itemsTable, usersTable } from "@workspace/db";

const router: IRouter = Router();

// GET /stats (public)
router.get("/stats", async (_req, res): Promise<void> => {
  // Count by type
  const [lostCount] = await db
    .select({ count: count() })
    .from(itemsTable)
    .where(eq(itemsTable.type, "Lost"));

  const [foundCount] = await db
    .select({ count: count() })
    .from(itemsTable)
    .where(eq(itemsTable.type, "Found"));

  const [userCount] = await db.select({ count: count() }).from(usersTable);

  // Recent 6 items with userName
  const recentItems = await db
    .select({
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
    })
    .from(itemsTable)
    .innerJoin(usersTable, eq(itemsTable.userId, usersTable.id))
    .orderBy(desc(itemsTable.createdAt))
    .limit(6);

  res.json({
    totalLost: lostCount?.count ?? 0,
    totalFound: foundCount?.count ?? 0,
    totalUsers: userCount?.count ?? 0,
    recentItems,
  });
});

export default router;
