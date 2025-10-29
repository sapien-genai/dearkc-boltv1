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
export const listBusinesses = query({
  args: {
    paginationOpts: paginationOptsValidator,
    categoryId: v.optional(v.id("categories")),
    featured: v.optional(v.boolean()),
    verified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.categoryId) {
      let query = ctx.db
        .query("businesses")
        .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId));
      
      if (args.featured) {
        query = query.filter((q) => q.eq(q.field("featured"), true));
      }
      
      if (args.verified) {
        query = query.filter((q) => q.eq(q.field("verified"), true));
      }
      
      return await query
        .order("desc")
        .paginate(args.paginationOpts);
    }
    
    let query = ctx.db.query("businesses");
    
    if (args.featured) {
      query = query.filter((q) => q.eq(q.field("featured"), true));
    }
    
    if (args.verified) {
      query = query.filter((q) => q.eq(q.field("verified"), true));
    }
    
    return await query
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getBusiness = query({
  args: { id: v.id("businesses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getBusinessBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("businesses")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const searchBusinesses = query({
  args: { 
    searchTerm: v.string(),
    categoryId: v.optional(v.id("categories")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    let query = ctx.db
      .query("businesses")
      .withSearchIndex("search_businesses", (q) => 
        q.search("name", args.searchTerm)
      );
    
    if (args.categoryId) {
      query = query.filter((q) => q.eq(q.field("categoryId"), args.categoryId));
    }
    
    return await query.take(limit);
  },
});

// Admin queries
export const listAllBusinesses = query({
  args: { 
    paginationOpts: paginationOptsValidator,
    verified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    if (args.verified !== undefined) {
      return await ctx.db
        .query("businesses")
        .withIndex("by_verified", (q) => q.eq("verified", args.verified!))
        .order("desc")
        .paginate(args.paginationOpts);
    }
    
    return await ctx.db
      .query("businesses")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Admin mutations
export const createBusiness = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    address: v.string(),
    neighborhood: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    ownerId: v.optional(v.id("users")),
    logo: v.optional(v.id("_storage")),
    images: v.array(v.id("_storage")),
    hours: v.optional(v.string()),
    priceRange: v.optional(v.string()),
    featured: v.boolean(),
    verified: v.boolean(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    return await ctx.db.insert("businesses", {
      ...args,
      rating: 0,
      reviewCount: 0,
    });
  },
});

export const updateBusiness = mutation({
  args: {
    id: v.id("businesses"),
    slug: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    neighborhood: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    ownerId: v.optional(v.id("users")),
    logo: v.optional(v.id("_storage")),
    images: v.optional(v.array(v.id("_storage"))),
    hours: v.optional(v.string()),
    priceRange: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    verified: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const { id, ...updates } = args;
    const business = await ctx.db.get(id);
    
    if (!business) {
      throw new Error("Business not found");
    }
    
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const deleteBusiness = mutation({
  args: { id: v.id("businesses") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const business = await ctx.db.get(args.id);
    if (!business) {
      throw new Error("Business not found");
    }
    
    await ctx.db.delete(args.id);
    return args.id;
  },
});
