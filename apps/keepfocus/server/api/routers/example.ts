import { z } from "zod";
import { eq } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { items } from "@/server/db/schema";

export const exampleRouter = createTRPCRouter({
  // Get all items
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(items);
  }),

  // Get item by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db
        .select()
        .from(items)
        .where(eq(items.id, input.id))
        .limit(1);

      return item[0] ?? null;
    }),

  // Create new item
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(256),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [newItem] = await ctx.db
        .insert(items)
        .values({
          name: input.name,
          description: input.description,
        })
        .returning();

      return newItem;
    }),

  // Update item
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(256).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedItem] = await ctx.db
        .update(items)
        .set({
          name: input.name,
          description: input.description,
          updatedAt: new Date(),
        })
        .where(eq(items.id, input.id))
        .returning();

      return updatedItem;
    }),

  // Delete item
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(items).where(eq(items.id, input.id));
      return { success: true };
    }),
});
