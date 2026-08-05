import bcrypt from "bcryptjs";
import { db, usersTable, itemsTable } from "@workspace/db";
import { logger } from "./lib/logger";

export async function seedDatabase(): Promise<void> {
  const existing = await db.select({ id: usersTable.id }).from(usersTable).limit(1);
  if (existing.length > 0) return;

  logger.info("Seeding initial database data...");

  const adminHash = await bcrypt.hash("admin123", 10);
  const studentHash = await bcrypt.hash("password123", 10);

  const [admin, alice, bob] = await db
    .insert(usersTable)
    .values([
      { name: "Admin", email: "admin@campus.edu", passwordHash: adminHash, role: "admin" },
      { name: "Alice Johnson", email: "alice@campus.edu", passwordHash: studentHash, role: "student" },
      { name: "Bob Smith", email: "bob@campus.edu", passwordHash: studentHash, role: "student" },
    ])
    .returning();

  await db.insert(itemsTable).values([
    {
      title: "Blue Backpack",
      description: "Navy blue JanSport backpack with a broken front zipper. Has a small keychain of a green frog attached to the main zipper.",
      category: "Clothing",
      type: "Lost",
      location: "Student Union, 2nd Floor Lounge",
      date: "2026-07-28",
      contact: "+1 (555) 234-5678",
      userId: alice.id,
    },
    {
      title: "MacBook Pro Charger (USB-C)",
      description: "Apple 61W USB-C power adapter, white. Found plugged into a charging station. Has a small scratch on the side.",
      category: "Electronics",
      type: "Found",
      location: "Main Library, Ground Floor",
      date: "2026-07-30",
      contact: "+1 (555) 345-6789",
      userId: bob.id,
    },
    {
      title: "Student ID Card",
      description: "Found a student ID card near the cafeteria entrance. Photo and name visible. Please contact to arrange return.",
      category: "ID/Cards",
      type: "Found",
      location: "Campus Cafeteria, Building A",
      date: "2026-08-01",
      contact: "+1 (555) 456-7890",
      userId: alice.id,
    },
    {
      title: "Silver Keys with Toyota Keychain",
      description: "Set of 3 keys on a ring with a Toyota logo keychain and a small compass attached. Lost somewhere near Parking Lot B.",
      category: "Keys",
      type: "Lost",
      location: "Parking Lot B",
      date: "2026-08-03",
      contact: "+1 (555) 567-8901",
      userId: bob.id,
    },
    {
      title: "Calculus Textbook (Stewart, 8th Edition)",
      description: "Lost my Calculus textbook. Has my name written on the inside cover and highlighted notes throughout chapters 4-7.",
      category: "Books",
      type: "Lost",
      location: "Math & Science Building, Room 204",
      date: "2026-08-04",
      contact: "+1 (555) 678-9012",
      userId: alice.id,
    },
    {
      title: "Black Umbrella with Red Handle",
      description: "Found a compact black umbrella with a distinctive red handle in the lobby. Brand: Totes.",
      category: "Accessories",
      type: "Found",
      location: "Engineering Building, Main Lobby",
      date: "2026-08-05",
      contact: "+1 (555) 789-0123",
      userId: bob.id,
    },
  ]);

  logger.info("Database seeded successfully. Admin: admin@campus.edu / admin123, Students: alice@campus.edu, bob@campus.edu / password123");
}
