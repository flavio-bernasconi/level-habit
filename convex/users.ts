import { v } from 'convex/values'
import { type QueryCtx, mutation, query } from './_generated/server'

export const store = mutation({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Called storeUser without authentication present')
    }

    const user = await getUser(ctx, identity.tokenIdentifier!)
    if (user !== null) {
      if (
        user.name !== identity.name ||
        user.username !== identity.nickname ||
        user.pictureUrl !== identity.pictureUrl ||
        user.tokenIdentifier !== identity.tokenIdentifier
      ) {
        await ctx.db.patch(user._id, {
          tokenIdentifier: identity.tokenIdentifier,
          name: identity.name,
          username: identity.nickname,
          pictureUrl: identity.pictureUrl,
          email: identity.email
        })
      }
      return user._id
    }
    // If it's a new identity, create a new `User`.
    return await ctx.db.insert('users', {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name!,
      username: identity.nickname!,
      pictureUrl: identity.pictureUrl!,
      email: identity.email!,
      level: 1
    })
  }
})

export const get = query({
  args: {
    username: v.string()
  },
  handler: async (ctx, args) => {
    return await getUser(ctx, args.username)
  }
})

export async function getUser(ctx: QueryCtx, tokenIdentifier: string) {
  return await ctx.db
    .query('users')
    .withIndex('tokenIdentifier', q => q.eq('tokenIdentifier', tokenIdentifier))
    .unique()
}
