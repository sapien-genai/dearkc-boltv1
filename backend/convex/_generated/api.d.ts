/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as businesses from "../businesses.js";
import type * as categories from "../categories.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as posts from "../posts.js";
import type * as router from "../router.js";
import type * as setup from "../setup.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  businesses: typeof businesses;
  categories: typeof categories;
  events: typeof events;
  http: typeof http;
  posts: typeof posts;
  router: typeof router;
  setup: typeof setup;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
