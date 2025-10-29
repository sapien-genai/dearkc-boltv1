import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

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
export const listCategories = query({
  args: { parentId: v.optional(v.id("categories")) },
  handler: async (ctx, args) => {
    if (args.parentId) {
      return await ctx.db
        .query("categories")
        .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
        .order("asc")
        .collect();
    }
    
    return await ctx.db
      .query("categories")
      .withIndex("by_sort_order", (q) => q.gte("sortOrder", 0))
      .collect();
  },
});

export const getCategoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Admin queries
export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("categories")
      .withIndex("by_sort_order", (q) => q.gte("sortOrder", 0))
      .collect();
  },
});

export const getCategory = query({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

// Admin mutations
export const createCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    parentId: v.optional(v.id("categories")),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    // Check if slug already exists
    const existingCategory = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (existingCategory) {
      throw new Error("A category with this slug already exists");
    }
    
    return await ctx.db.insert("categories", args);
  },
});

export const updateCategory = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    parentId: v.optional(v.id("categories")),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const { id, ...updates } = args;
    const category = await ctx.db.get(id);
    
    if (!category) {
      throw new Error("Category not found");
    }
    
    // Check slug uniqueness if updating slug
    if (updates.slug && updates.slug !== category.slug) {
      const existingCategory = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", updates.slug!))
        .first();
      
      if (existingCategory) {
        throw new Error("A category with this slug already exists");
      }
    }
    
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const deleteCategory = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const category = await ctx.db.get(args.id);
    if (!category) {
      throw new Error("Category not found");
    }
    
    // Check if category has posts
    const postsWithCategory = await ctx.db
      .query("posts")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .first();
    
    if (postsWithCategory) {
      throw new Error("Cannot delete category that has posts. Please reassign posts first.");
    }
    
    await ctx.db.delete(args.id);
    return args.id;
  },
});
