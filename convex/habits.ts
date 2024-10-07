import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./users";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    const user = await getUser(ctx, identity.tokenIdentifier!);

    return await ctx.db
      .query("habits")
      .filter((q) => q.eq(q.field("authorId"), user?._id))
      .collect();
  },
});

export const getHabit = query({
  args: { habitId: v.id("habits") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    const user = await getUser(ctx, identity.tokenIdentifier!);

    const habit = ctx.db
      .query("habits")
      .filter((q) =>
        q.and(
          q.eq(q.field("_id"), args.habitId),
          q.eq(q.field("authorId"), user?._id)
        )
      );

    return habit;
  },
});

export const createNewHabit = mutation({
  args: {
    name: v.string(),
    levelsDescription: v.object({
      show: v.string(),
      easy: v.string(),
      medium: v.string(),
      hard: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const user = await getUser(ctx, identity.tokenIdentifier!);
    if (!user) {
      throw new Error("User not found");
    }

    const newHabit = await ctx.db.insert("habits", {
      ...args,
      authorId: user._id,
    });
    return newHabit;
  },
});
