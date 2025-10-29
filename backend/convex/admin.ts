import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

async function requireSuperAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Authentication required");
  }
  
  const adminUser = await ctx.db
    .query("adminUsers")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();
    
  if (!adminUser || adminUser.role !== "super_admin") {
    throw new Error("Super admin access required");
  }
  
  return { userId, adminUser };
}

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

// Check if current user is admin
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }
    
    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    return !!adminUser;
  },
});

// Get current admin user details
export const getCurrentAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    
    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!adminUser) {
      return null;
    }
    
    const user = await ctx.db.get(userId);
    return {
      ...adminUser,
      user,
    };
  },
});

// List all admin users
export const listAdminUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    
    const adminUsers = await ctx.db.query("adminUsers").collect();
    
    const adminUsersWithDetails = await Promise.all(
      adminUsers.map(async (adminUser) => {
        const user = await ctx.db.get(adminUser.userId);
        return {
          ...adminUser,
          user,
        };
      })
    );
    
    return adminUsersWithDetails;
  },
});

// Create admin user
export const createAdminUser = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("super_admin"), v.literal("admin"), v.literal("moderator"), v.literal("editor")),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId: currentUserId } = await requireSuperAdmin(ctx);
    
    // Check if user already exists as admin
    const existingAdmin = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    if (existingAdmin) {
      throw new Error("User is already an admin");
    }
    
    // Check if user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    return await ctx.db.insert("adminUsers", {
      ...args,
      createdBy: currentUserId,
    });
  },
});

// Update admin user
export const updateAdminUser = mutation({
  args: {
    id: v.id("adminUsers"),
    role: v.optional(v.union(v.literal("super_admin"), v.literal("admin"), v.literal("moderator"), v.literal("editor"))),
    permissions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    
    const { id, ...updates } = args;
    const adminUser = await ctx.db.get(id);
    
    if (!adminUser) {
      throw new Error("Admin user not found");
    }
    
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Remove admin user
export const removeAdminUser = mutation({
  args: { id: v.id("adminUsers") },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    
    const adminUser = await ctx.db.get(args.id);
    if (!adminUser) {
      throw new Error("Admin user not found");
    }
    
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Dashboard stats
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    
    const [
      totalPosts,
      publishedPosts,
      totalEvents,
      upcomingEvents,
      totalBusinesses,
      verifiedBusinesses,
      totalUsers,
      totalCategories,
    ] = await Promise.all([
      ctx.db.query("posts").collect().then(posts => posts.length),
      ctx.db.query("posts").withIndex("by_status", (q) => q.eq("status", "published")).collect().then(posts => posts.length),
      ctx.db.query("events").collect().then(events => events.length),
      ctx.db.query("events").withIndex("by_date", (q) => q.gte("startDate", Date.now())).collect().then(events => events.length),
      ctx.db.query("businesses").collect().then(businesses => businesses.length),
      ctx.db.query("businesses").withIndex("by_verified", (q) => q.eq("verified", true)).collect().then(businesses => businesses.length),
      ctx.db.query("users").collect().then(users => users.length),
      ctx.db.query("categories").collect().then(categories => categories.length),
    ]);
    
    return {
      posts: { total: totalPosts, published: publishedPosts },
      events: { total: totalEvents, upcoming: upcomingEvents },
      businesses: { total: totalBusinesses, verified: verifiedBusinesses },
      users: { total: totalUsers },
      categories: { total: totalCategories },
    };
  },
});
