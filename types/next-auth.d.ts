import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "CUSTOMER" | "OWNER";
    };
  }

  interface User {
    role?: "CUSTOMER" | "OWNER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "CUSTOMER" | "OWNER";
  }
}
