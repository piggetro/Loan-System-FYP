/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Lucia, TimeSpan } from "lucia";

import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";
import type { User } from "@prisma/client";

const client = new PrismaClient();

const adapter = new PrismaAdapter(client.session, client.user);

export const lucia = new Lucia(adapter, {
  getUserAttributes: (attributes) => {
    return {
      name: attributes.name,
      email: attributes.email,
      role: attributes.roleId,
    };
  },
  sessionExpiresIn: new TimeSpan(7, "d"),
  sessionCookie: {
    expires: false,
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
    },
  },
});

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
  }
}

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DatabaseSessionAttributes {}
type DatabaseUserAttributes = Omit<User, "hashedPassword">;
