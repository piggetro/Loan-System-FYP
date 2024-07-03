/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Lucia, TimeSpan } from "lucia";
import { Mysql2Adapter } from "@lucia-auth/adapter-mysql";
import { type Session, type User } from "@/db/types";
import { createPool } from "mysql2/promise";
import { NodePostgresAdapter } from "@lucia-auth/adapter-postgresql";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

// const pool = createPool({
//   database: process.env.DB_NAME!,
//   host: process.env.DB_HOST!,
//   user: process.env.DB_USERNAME!,
//   password: process.env.DB_PASSWORD!,
//   port: Number(process.env.DB_PORT!),
//   connectionLimit: 10,
// });
// const adapter = new Mysql2Adapter(pool, { user: "User", session: "Session" });

const pool = new Pool({
  database: process.env.DB_NAME!,
  host: process.env.DB_HOST!,
  user: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  port: Number(process.env.DB_PORT!),
  max: 10,
});

const adapter = new NodePostgresAdapter(pool, {
  user: "User",
  session: "Session",
});

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
