import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Content management
  posts: defineTable({
    title: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    slug: v.string(),
    categoryId: v.optional(v.id("categories")),
    authorId: v.id("users"),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    featuredImage: v.optional(v.id("_storage")),
    tags: v.array(v.string()),
    publishedAt: v.optional(v.number()),
    viewCount: v.number(),
    featured: v.boolean(),
  })
    .index("by_status", ["status"])
    .index("by_category", ["categoryId"])
    .index("by_author", ["authorId"])
    .index("by_slug", ["slug"])
    .index("by_published_date", ["publishedAt"])
    .searchIndex("search_posts", {
      searchField: "title",
      filterFields: ["status", "categoryId"]
    }),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    parentId: v.optional(v.id("categories")),
    sortOrder: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_parent", ["parentId"])
    .index("by_sort_order", ["sortOrder"]),

  events: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    location: v.string(),
    address: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    startDate: v.number(),
    endDate: v.number(),
    organizerId: v.id("users"),
    categoryId: v.optional(v.id("categories")),
    featuredImage: v.optional(v.id("_storage")),
    ticketUrl: v.optional(v.string()),
    price: v.optional(v.string()),
    status: v.union(v.literal("upcoming"), v.literal("ongoing"), v.literal("completed"), v.literal("cancelled")),
    featured: v.boolean(),
    tags: v.array(v.string()),
  })
    .index("by_date", ["startDate"])
    .index("by_status", ["status"])
    .index("by_organizer", ["organizerId"])
    .index("by_category", ["categoryId"])
    .index("by_slug", ["slug"])
    .searchIndex("search_events", {
      searchField: "title",
      filterFields: ["status", "categoryId"]
    }),

  businesses: defineTable({
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
    rating: v.optional(v.number()),
    reviewCount: v.number(),
    featured: v.boolean(),
    verified: v.boolean(),
    tags: v.array(v.string()),
  })
    .index("by_category", ["categoryId"])
    .index("by_owner", ["ownerId"])
    .index("by_featured", ["featured"])
    .index("by_verified", ["verified"])
    .index("by_slug", ["slug"])
    .searchIndex("search_businesses", {
      searchField: "name",
      filterFields: ["categoryId", "verified"]
    }),

  reviews: defineTable({
    businessId: v.id("businesses"),
    userId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
    images: v.array(v.id("_storage")),
    helpful: v.number(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  })
    .index("by_business", ["businessId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  comments: defineTable({
    postId: v.optional(v.id("posts")),
    eventId: v.optional(v.id("events")),
    businessId: v.optional(v.id("businesses")),
    userId: v.id("users"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    likes: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_event", ["eventId"])
    .index("by_business", ["businessId"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentId"])
    .index("by_status", ["status"]),

  adminUsers: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("super_admin"), v.literal("admin"), v.literal("moderator"), v.literal("editor")),
    permissions: v.array(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_role", ["role"]),

  settings: defineTable({
    key: v.string(),
    value: v.string(),
    type: v.union(v.literal("string"), v.literal("number"), v.literal("boolean"), v.literal("json")),
    description: v.optional(v.string()),
    category: v.string(),
  })
    .index("by_key", ["key"])
    .index("by_category", ["category"]),

  analytics: defineTable({
    type: v.union(v.literal("page_view"), v.literal("post_view"), v.literal("event_view"), v.literal("business_view")),
    entityId: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    sessionId: v.string(),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
    metadata: v.optional(v.object({})),
  })
    .index("by_type", ["type"])
    .index("by_entity", ["entityId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
