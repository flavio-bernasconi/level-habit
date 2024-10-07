import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./users";

export const get = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }
    const user = await getUser(ctx, identity.tokenIdentifier!);
    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db
      .query("habitsByDate")
      .filter((q) =>
        q.and(
          q.eq(q.field("date"), args.date),
          q.eq(q.field("authorId"), user._id)
        )
      )
      .collect();
  },
});

export const getTotalCounter = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }
    const user = await getUser(ctx, identity.tokenIdentifier!);

    const list = await ctx.db
      .query("habitsByDate")
      .filter((q) => q.eq(q.field("authorId"), user?._id))
      .collect();

    const total = list.reduce((acc, item) => acc + item.value, 0);
    return total;
  },
});

export const getTodayCounter = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }
    const user = await getUser(ctx, identity.tokenIdentifier!);
    if (!user) {
      throw new Error("User not found");
    }

    const list = await ctx.db
      .query("habitsByDate")
      .filter((q) =>
        q.and(
          q.eq(q.field("date"), args.date),
          q.eq(q.field("authorId"), user._id)
        )
      )
      .collect();

    const total = list.reduce((acc, item) => acc + item.value, 0);
    return total;
  },
});

export const createOrUpdateHabitByDate = mutation({
  args: {
    date: v.string(),
    habitId: v.id("habits"),
    value: v.optional(v.number()),
    activeLevel: v.optional(
      v.union(
        v.literal("show"),
        v.literal("easy"),
        v.literal("medium"),
        v.literal("hard")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }
    const user = await getUser(ctx, identity.tokenIdentifier!);
    if (!user) {
      throw new Error("User not found");
    }

    const habitOrNull = await ctx.db
      .query("habitsByDate")
      .filter((q) =>
        q.and(
          q.eq(q.field("date"), args.date),
          q.eq(q.field("habitId"), args.habitId),
          q.eq(q.field("authorId"), user._id)
        )
      )
      .first();

    if (habitOrNull) {
      await ctx.db.patch(habitOrNull._id, {
        value: args?.value || 0,
        activeLevel: args.activeLevel,
      });
    } else {
      await ctx.db.insert("habitsByDate", {
        date: args.date,
        habitId: args.habitId,
        value: args?.value || 0,
        activeLevel: args.activeLevel,
        authorId: user._id,
      });
    }
  },
});
