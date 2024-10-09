import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    pictureUrl: v.string(),
    email: v.string(),
    level: v.optional(v.number())
  })
    .index('tokenIdentifier', ['tokenIdentifier'])
    .index('username', ['username']),
  habits: defineTable({
    authorId: v.id('users'),
    name: v.string(),
    levelsDescription: v.object({
      show: v.string(),
      easy: v.string(),
      medium: v.string(),
      hard: v.string()
    })
  }),
  habitsByDate: defineTable({
    date: v.string(),
    habitId: v.id('habits'),
    value: v.number(),
    authorId: v.id('users'),
    activeLevel: v.optional(
      v.union(
        v.literal('show'),
        v.literal('easy'),
        v.literal('medium'),
        v.literal('hard')
      )
    )
  }).index('authorId', ['authorId']),
  levels: defineTable({
    id: v.union(
      v.literal('show'),
      v.literal('easy'),
      v.literal('medium'),
      v.literal('hard')
    ),
    label: v.string(),
    value: v.number()
  })
})
