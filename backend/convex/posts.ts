import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";

// Helper function to check if user is admin
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
export const listPublishedPosts = query({
  args: { 
    paginationOpts: paginationOptsValidator,
    categoryId: v.optional(v.id("categories")),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("posts")
      .withIndex("by_status", (q) => q.eq("status", "published"));
    
    if (args.categoryId) {
      query = ctx.db
        .query("posts")
        .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
        .filter((q) => q.eq(q.field("status"), "published"));
    }
    
    if (args.featured) {
      query = query.filter((q) => q.eq(q.field("featured"), true));
    }
    
    return await query
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("status"), "published"))
      .first();
    
    return post;
  },
});

export const searchPosts = query({
  args: { 
    searchTerm: v.string(),
    categoryId: v.optional(v.id("categories")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    let query = ctx.db
      .query("posts")
      .withSearchIndex("search_posts", (q) => 
        q.search("title", args.searchTerm).eq("status", "published")
      );
    
    if (args.categoryId) {
      query = query.filter((q) => q.eq(q.field("categoryId"), args.categoryId));
    }
    
    return await query.take(limit);
  },
});

// Admin queries
export const listAllPosts = query({
  args: { 
    paginationOpts: paginationOptsValidator,
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    if (args.status) {
      return await ctx.db
        .query("posts")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .paginate(args.paginationOpts);
    }
    
    return await ctx.db
      .query("posts")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getPost = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

// Admin mutations
export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    slug: v.string(),
    categoryId: v.optional(v.id("categories")),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    featuredImage: v.optional(v.id("_storage")),
    tags: v.array(v.string()),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);
    
    // Check if slug already exists
    const existingPost = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (existingPost) {
      throw new Error("A post with this slug already exists");
    }
    
    const postId = await ctx.db.insert("posts", {
      ...args,
      authorId: userId,
      viewCount: 0,
      publishedAt: args.status === "published" ? Date.now() : undefined,
    });
    
    return postId;
  },
});

export const updatePost = mutation({
  args: {
    id: v.id("posts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    slug: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    featuredImage: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const { id, ...updates } = args;
    const post = await ctx.db.get(id);
    
    if (!post) {
      throw new Error("Post not found");
    }
    
    // Check slug uniqueness if updating slug
    if (updates.slug && updates.slug !== post.slug) {
      const existingPost = await ctx.db
        .query("posts")
        .withIndex("by_slug", (q) => q.eq("slug", updates.slug!))
        .first();
      
      if (existingPost) {
        throw new Error("A post with this slug already exists");
      }
    }
    
    // Set publishedAt if changing to published status
    const finalUpdates: any = { ...updates };
    if (updates.status === "published" && post.status !== "published") {
      finalUpdates.publishedAt = Date.now();
    }
    
    await ctx.db.patch(id, finalUpdates);
    return id;
  },
});

export const deletePost = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new Error("Post not found");
    }
    
    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
