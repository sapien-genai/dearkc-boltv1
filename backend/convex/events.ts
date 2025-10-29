import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Authentication required");
  }
  
  const adminUser = await ctx.db
    .query("adminUsers")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();
    
  if (!adminUser) {
    throw new Error("Admin access required");
  }
  
  return { userId, adminUser };
}

// Public queries
export const listUpcomingEvents = query({
  args: {
    paginationOpts: paginationOptsValidator,
    categoryId: v.optional(v.id("categories")),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    let query = ctx.db
      .query("events")
      .withIndex("by_date", (q) => q.gte("startDate", now));
    
    if (args.categoryId) {
      query = ctx.db
        .query("events")
        .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
        .filter((q) => q.gte(q.field("startDate"), now));
    }
    
    if (args.featured) {
      query = query.filter((q) => q.eq(q.field("featured"), true));
    }
    
    return await query
      .order("asc")
      .paginate(args.paginationOpts);
  },
});

export const getEvent = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getEventBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const searchEvents = query({
  args: { 
    searchTerm: v.string(),
    categoryId: v.optional(v.id("categories")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    let query = ctx.db
      .query("events")
      .withSearchIndex("search_events", (q) => 
        q.search("title", args.searchTerm)
      );
    
    if (args.categoryId) {
      query = query.filter((q) => q.eq(q.field("categoryId"), args.categoryId));
    }
    
    return await query.take(limit);
  },
});

// Admin queries
export const listAllEvents = query({
  args: { 
    paginationOpts: paginationOptsValidator,
    status: v.optional(v.union(v.literal("upcoming"), v.literal("ongoing"), v.literal("completed"), v.literal("cancelled"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    if (args.status) {
      return await ctx.db
        .query("events")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .paginate(args.paginationOpts);
    }
    
    return await ctx.db
      .query("events")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Admin mutations
export const createEvent = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    location: v.string(),
    address: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    startDate: v.number(),
    endDate: v.number(),
    categoryId: v.optional(v.id("categories")),
    featuredImage: v.optional(v.id("_storage")),
    ticketUrl: v.optional(v.string()),
    price: v.optional(v.string()),
    status: v.union(v.literal("upcoming"), v.literal("ongoing"), v.literal("completed"), v.literal("cancelled")),
    featured: v.boolean(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);
    
    return await ctx.db.insert("events", {
      ...args,
      organizerId: userId,
    });
  },
});

export const updateEvent = mutation({
  args: {
    id: v.id("events"),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    address: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    featuredImage: v.optional(v.id("_storage")),
    ticketUrl: v.optional(v.string()),
    price: v.optional(v.string()),
    status: v.optional(v.union(v.literal("upcoming"), v.literal("ongoing"), v.literal("completed"), v.literal("cancelled"))),
    featured: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const { id, ...updates } = args;
    const event = await ctx.db.get(id);
    
    if (!event) {
      throw new Error("Event not found");
    }
    
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const deleteEvent = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }
    
    await ctx.db.delete(args.id);
    return args.id;
  },
});
