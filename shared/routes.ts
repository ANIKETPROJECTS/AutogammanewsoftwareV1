import { z } from "zod";
import { insertUserSchema, loginSchema, dashboardDataSchema } from "./schema";

export const api = {
  auth: {
    login: {
      method: "POST" as const,
      path: "/api/login",
      input: loginSchema,
      responses: {
        200: z.object({ id: z.string(), email: z.string() }),
        401: z.object({ message: z.string() }),
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/logout",
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: "GET" as const,
      path: "/api/user",
      responses: {
        200: z.object({ id: z.string(), email: z.string() }),
        401: z.void(),
      },
    },
  },
  dashboard: {
    get: {
      method: "GET" as const,
      path: "/api/dashboard",
      responses: {
        200: dashboardDataSchema,
      },
    },
  },
};
