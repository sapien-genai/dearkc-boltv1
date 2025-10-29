import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// API endpoint to get published posts
http.route({
  path: "/api/posts",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const categoryId = url.searchParams.get("categoryId");
    const featured = url.searchParams.get("featured") === "true";
    
    const posts = await ctx.runQuery(api.posts.listPublishedPosts, {
      paginationOpts: { numItems: limit, cursor: null },
      categoryId: categoryId as any,
      featured: featured || undefined,
    });

    const pageWithImages = await Promise.all(
      posts.page.map(async (post) => ({
        ...post,
        featuredImageUrl: post.featuredImage
          ? await ctx.storage.getUrl(post.featuredImage)
          : null,
      }))
    );

    return new Response(JSON.stringify({ ...posts, page: pageWithImages }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// API endpoint to get a single post by slug
http.route({
  path: "/api/posts/{slug}",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const slug = url.pathname.split("/").pop();
    
    if (!slug) {
      return new Response("Slug is required", { status: 400 });
    }
    
    const post = await ctx.runQuery(api.posts.getPostBySlug, { slug });
    
    if (!post) {
      return new Response("Post not found", { status: 404 });
    }
    
    return new Response(JSON.stringify(post), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// API endpoint to get events
http.route({
  path: "/api/events",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const categoryId = url.searchParams.get("categoryId");
    const featured = url.searchParams.get("featured") === "true";
    
    const events = await ctx.runQuery(api.events.listUpcomingEvents, {
      paginationOpts: { numItems: limit, cursor: null },
      categoryId: categoryId as any,
      featured: featured || undefined,
    });

    const pageWithImages = await Promise.all(
      events.page.map(async (event) => ({
        ...event,
        featuredImageUrl: event.featuredImage
          ? await ctx.storage.getUrl(event.featuredImage)
          : null,
      }))
    );

    return new Response(JSON.stringify({ ...events, page: pageWithImages }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// API endpoint to get a single event by slug
http.route({
  path: "/api/events/{slug}",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const slug = url.pathname.split("/").pop();

    if (!slug) {
      return new Response("Slug is required", { status: 400 });
    }

    const event = await ctx.runQuery(api.events.getEventBySlug, { slug });

    if (!event) {
      return new Response("Event not found", { status: 404 });
    }

    const payload = {
      ...event,
      featuredImageUrl: event.featuredImage
        ? await ctx.storage.getUrl(event.featuredImage)
        : null,
    };

    return new Response(JSON.stringify(payload), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// API endpoint to get businesses
http.route({
  path: "/api/businesses",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const categoryId = url.searchParams.get("categoryId");
    const featured = url.searchParams.get("featured") === "true";
    const verified = url.searchParams.get("verified") === "true";
    
    const businesses = await ctx.runQuery(api.businesses.listBusinesses, {
      paginationOpts: { numItems: limit, cursor: null },
      categoryId: categoryId as any,
      featured: featured || undefined,
      verified: verified || undefined,
    });

    const pageWithAssets = await Promise.all(
      businesses.page.map(async (business) => {
        const imageUrls = await Promise.all(
          business.images.map(async (imageId) =>
            (await ctx.storage.getUrl(imageId)) || null
          )
        );

        return {
          ...business,
          images: imageUrls.filter((url): url is string => Boolean(url)),
          logoUrl: business.logo
            ? await ctx.storage.getUrl(business.logo)
            : null,
        };
      })
    );

    return new Response(JSON.stringify({ ...businesses, page: pageWithAssets }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// API endpoint to get a business by slug
http.route({
  path: "/api/businesses/{slug}",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const slug = url.pathname.split("/").pop();

    if (!slug) {
      return new Response("Slug is required", { status: 400 });
    }

    const business = await ctx.runQuery(api.businesses.getBusinessBySlug, { slug });

    if (!business) {
      return new Response("Business not found", { status: 404 });
    }

    const imageUrls = await Promise.all(
      business.images.map(async (imageId) =>
        (await ctx.storage.getUrl(imageId)) || null
      )
    );

    const payload = {
      ...business,
      images: imageUrls.filter((url): url is string => Boolean(url)),
      logoUrl: business.logo ? await ctx.storage.getUrl(business.logo) : null,
    };

    return new Response(JSON.stringify(payload), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// API endpoint to get categories
http.route({
  path: "/api/categories",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const parentId = url.searchParams.get("parentId");
    
    const categories = await ctx.runQuery(api.categories.listCategories, {
      parentId: parentId as any,
    });
    
    return new Response(JSON.stringify(categories), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// Search endpoint
http.route({
  path: "/api/search",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");
    const type = url.searchParams.get("type") || "all";
    const limit = parseInt(url.searchParams.get("limit") || "10");
    
    if (!query) {
      return new Response("Query parameter 'q' is required", { status: 400 });
    }
    
    const results: any = {};
    
    if (type === "all" || type === "posts") {
      results.posts = await ctx.runQuery(api.posts.searchPosts, {
        searchTerm: query,
        limit,
      });
    }
    
    if (type === "all" || type === "events") {
      results.events = await ctx.runQuery(api.events.searchEvents, {
        searchTerm: query,
        limit,
      });
    }
    
    if (type === "all" || type === "businesses") {
      results.businesses = await ctx.runQuery(api.businesses.searchBusinesses, {
        searchTerm: query,
        limit,
      });
    }
    
    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

export default http;
