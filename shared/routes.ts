import { z } from "zod";
import { 
  insertUserSchema, 
  loginSchema, 
  dashboardDataSchema, 
  serviceMasterSchema, 
  insertServiceMasterSchema, 
  vehicleTypeSchema 
} from "./schema";

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
  masters: {
    services: {
      list: {
        method: "GET" as const,
        path: "/api/masters/services",
        responses: {
          200: z.array(serviceMasterSchema),
        },
      },
      create: {
        method: "POST" as const,
        path: "/api/masters/services",
        input: insertServiceMasterSchema,
        responses: {
          201: serviceMasterSchema,
        },
      },
      update: {
        method: "PATCH" as const,
        path: "/api/masters/services/:id",
        input: serviceMasterSchema.partial(),
        responses: {
          200: serviceMasterSchema,
          404: z.object({ message: z.string() }),
        },
      },
      delete: {
        method: "DELETE" as const,
        path: "/api/masters/services/:id",
        responses: {
          200: z.void(),
          404: z.object({ message: z.string() }),
        },
      },
    },
    vehicleTypes: {
      list: {
        method: "GET" as const,
        path: "/api/masters/vehicle-types",
        responses: {
          200: z.array(vehicleTypeSchema),
        },
      },
      create: {
        method: "POST" as const,
        path: "/api/masters/vehicle-types",
        input: vehicleTypeSchema.omit({ id: true }),
        responses: {
          201: vehicleTypeSchema,
        },
      },
    },
  },
};
