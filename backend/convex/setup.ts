import { mutation } from "./_generated/server";
import { v } from "convex/values";

// This mutation creates the initial admin user and sample data
export const setupInitialData = mutation({
  args: {
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.userEmail))
      .first();
    
    if (!user) {
      throw new Error("User not found. Please sign up first.");
    }
    
    // Check if admin user already exists
    const existingAdmin = await ctx.db
      .query("adminUsers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    
    if (existingAdmin) {
      throw new Error("User is already an admin");
    }
    
    // Create admin user
    const adminUserId = await ctx.db.insert("adminUsers", {
      userId: user._id,
      role: "super_admin",
      permissions: ["all"],
      createdBy: user._id,
    });
    
    // Create sample categories
    const newsCategory = await ctx.db.insert("categories", {
      name: "News & Updates",
      slug: "news",
      description: "Latest news and updates about Kansas City",
      color: "#3B82F6",
      icon: "📰",
      sortOrder: 1,
    });
    
    const eventsCategory = await ctx.db.insert("categories", {
      name: "Events",
      slug: "events",
      description: "Upcoming events in Kansas City",
      color: "#10B981",
      icon: "📅",
      sortOrder: 2,
    });
    
    const businessCategory = await ctx.db.insert("categories", {
      name: "Local Business",
      slug: "business",
      description: "Local businesses and services",
      color: "#F59E0B",
      icon: "🏢",
      sortOrder: 3,
    });
    
    const foodCategory = await ctx.db.insert("categories", {
      name: "Food & Dining",
      slug: "food",
      description: "Restaurants and food scene",
      color: "#EF4444",
      icon: "🍽️",
      sortOrder: 4,
    });
    
    // Create sample post
    await ctx.db.insert("posts", {
      title: "Welcome to DearKC!",
      content: "Welcome to DearKC, your community platform for Kansas City! This is a sample post to get you started. You can create, edit, and manage content through the admin portal.",
      excerpt: "Welcome to DearKC, your community platform for Kansas City!",
      slug: "welcome-to-dearkc",
      categoryId: newsCategory,
      authorId: user._id,
      status: "published",
      tags: ["welcome", "community", "kansas-city"],
      publishedAt: Date.now(),
      viewCount: 0,
      featured: true,
    });
    
    // Create sample event
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);
    
    await ctx.db.insert("events", {
      title: "Kansas City Community Meetup",
      slug: "kansas-city-community-meetup",
      description: "Join us for a community meetup to discuss local initiatives and connect with fellow Kansas City residents.",
      location: "Crown Center",
      address: "2450 Grand Blvd, Kansas City, MO 64108",
      latitude: 39.082237,
      longitude: -94.583116,
      startDate: tomorrow.getTime(),
      endDate: tomorrow.getTime() + (2 * 60 * 60 * 1000), // 2 hours later
      organizerId: user._id,
      categoryId: eventsCategory,
      status: "upcoming",
      featured: true,
      tags: ["community", "meetup", "networking"],
    });
    
    // Create sample business
    await ctx.db.insert("businesses", {
      name: "Joe's Kansas City Bar-B-Que",
      slug: "joes-kansas-city-bar-b-que",
      description: "Famous Kansas City barbecue restaurant known for their burnt ends and Z-Man sandwich.",
      address: "3002 W 47th Ave, Kansas City, KS 66103",
      neighborhood: "Westwood",
      latitude: 39.041713,
      longitude: -94.620316,
      phone: "(913) 722-3366",
      website: "https://www.joeskc.com",
      categoryId: foodCategory,
      images: [],
      hours: "Mon-Sun: 11:00 AM - 9:00 PM",
      priceRange: "$$",
      rating: 0,
      reviewCount: 0,
      featured: true,
      verified: true,
      tags: ["barbecue", "kansas-city", "burnt-ends"],
    });
    
    return {
      adminUserId,
      message: "Initial setup completed successfully! You now have admin access.",
    };
  },
});
