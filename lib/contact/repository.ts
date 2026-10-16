import "server-only";

import { requirePrisma } from "@/lib/db";

export async function createContactMessage(input: {
  name: string;
  email: string;
  message: string;
}) {
  return requirePrisma().contactMessage.create({
    data: {
      name: input.name,
      email: input.email,
      message: input.message,
    },
  });
}

export async function listContactMessages() {
  return requirePrisma().contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function countContactMessages() {
  return requirePrisma().contactMessage.count();
}
