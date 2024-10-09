import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getUser } from './users'

export const get = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity === null) {
      throw new Error('Not authenticated')
    }
    const user = await getUser(ctx, identity.tokenIdentifier!)

    return await ctx.db
      .query('habits')
      .filter(q => q.eq(q.field('authorId'), user?._id))
      .collect()
  }
})

export const getHabit = query({
  args: { habitId: v.id('habits') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity === null) {
      throw new Error('Not authenticated')
    }
    const user = await getUser(ctx, identity.tokenIdentifier!)

    const habit = ctx.db
      .query('habits')
      .filter(q =>
        q.and(
          q.eq(q.field('_id'), args.habitId),
          q.eq(q.field('authorId'), user?._id)
        )
      )

    return habit
  }
})

export const createNewHabit = mutation({
  args: {
    name: v.string(),
    levelsDescription: v.object({
      show: v.string(),
      easy: v.string(),
      medium: v.string(),
      hard: v.string()
    })
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity === null) {
      throw new Error('Not authenticated')
    }

    const user = await getUser(ctx, identity.tokenIdentifier!)
    if (!user) {
      throw new Error('User not found')
    }

    const newHabit = await ctx.db.insert('habits', {
      ...args,
      authorId: user._id
    })
    return newHabit
  }
})

export const editHabit = mutation({
  args: {
    id: v.id('habits'),
    name: v.string(),
    levelsDescription: v.object({
      show: v.string(),
      easy: v.string(),
      medium: v.string(),
      hard: v.string()
    })
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity === null) {
      throw new Error('Not authenticated')
    }

    const user = await getUser(ctx, identity.tokenIdentifier!)
    if (!user) {
      throw new Error('User not found')
    }

    const { id, ...body } = args

    const editHabit = await ctx.db.patch(id, body)
    return editHabit
  }
})

export const deleteHabitById = mutation({
  args: {
    id: v.id('habits')
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    const toDelete = await ctx.db
      .query('habitsByDate')
      .filter(q => q.eq(q.field('habitId'), args.id))
      .collect()

    for (const habitByDate of toDelete) {
      await ctx.db.delete(habitByDate._id)
    }
  }
})

export const getTotalCounter = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Called storeUser without authentication present')
    }
    const user = await getUser(ctx, identity.tokenIdentifier!)

    const list = await ctx.db
      .query('habitsByDate')
      .filter(q => q.eq(q.field('authorId'), user?._id))
      .collect()

    const total = list.reduce((acc, item) => acc + item.value, 0)
    return total
  }
})
