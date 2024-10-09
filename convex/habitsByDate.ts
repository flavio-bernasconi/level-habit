import { v } from 'convex/values'
import { getCurrentLevel } from '../src/helpers/function'
import { mutation, query } from './_generated/server'
import { getTotalCounter } from './habits'
import { getUser } from './users'

export const get = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Called storeUser without authentication present')
    }
    const user = await getUser(ctx, identity.tokenIdentifier!)
    if (!user) {
      throw new Error('User not found')
    }

    return await ctx.db
      .query('habitsByDate')
      .filter(q =>
        q.and(
          q.eq(q.field('date'), args.date),
          q.eq(q.field('authorId'), user._id)
        )
      )
      .collect()
  }
})

export const getRangeDates = query({
  args: { habitId: v.id('habits'), startDate: v.string(), endDate: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Called storeUser without authentication present')
    }
    const user = await getUser(ctx, identity.tokenIdentifier!)
    if (!user) {
      throw new Error('User not found')
    }

    return await ctx.db
      .query('habitsByDate')
      .filter(q => {
        return q.and(
          q.gte(q.field('date'), args.startDate),
          q.lte(q.field('date'), args.endDate),
          q.eq(q.field('authorId'), user._id),
          q.eq(q.field('habitId'), args.habitId)
        )
      })
      .collect()
  }
})

export const getTodayCounter = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Called storeUser without authentication present')
    }
    const user = await getUser(ctx, identity.tokenIdentifier!)
    if (!user) {
      throw new Error('User not found')
    }

    const list = await ctx.db
      .query('habitsByDate')
      .filter(q =>
        q.and(
          q.eq(q.field('date'), args.date),
          q.eq(q.field('authorId'), user._id)
        )
      )
      .collect()

    const total = list.reduce((acc, item) => acc + item.value, 0)
    return total
  }
})

export const createOrUpdateHabitByDate = mutation({
  args: {
    date: v.string(),
    habitId: v.id('habits'),
    value: v.optional(v.number()),
    activeLevel: v.optional(
      v.union(
        v.literal('show'),
        v.literal('easy'),
        v.literal('medium'),
        v.literal('hard')
      )
    )
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Called storeUser without authentication present')
    }
    const user = await getUser(ctx, identity.tokenIdentifier!)
    if (!user) {
      throw new Error('User not found')
    }

    const habitOrNull = await ctx.db
      .query('habitsByDate')
      .filter(q =>
        q.and(
          q.eq(q.field('date'), args.date),
          q.eq(q.field('habitId'), args.habitId),
          q.eq(q.field('authorId'), user._id)
        )
      )
      .first()

    if (habitOrNull) {
      const total = await getTotalCounter(ctx, {})
      const newLevel = getCurrentLevel(total).level
      if (user && user.level !== newLevel) {
        await ctx.db.patch(user._id, {
          level: newLevel
        })
      }

      await ctx.db.patch(habitOrNull._id, {
        value: args?.value || 0,
        activeLevel: args.activeLevel
      })
    } else {
      await ctx.db.insert('habitsByDate', {
        date: args.date,
        habitId: args.habitId,
        value: args?.value || 0,
        activeLevel: args.activeLevel,
        authorId: user._id
      })
    }
  }
})
