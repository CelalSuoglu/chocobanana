"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/session";
import {
  closePublicSiteNow,
  openPublicSiteForThirtyMinutes,
} from "@/lib/site/public-opening";

function refreshPublicPages() {
  revalidatePath("/owner");
  revalidatePath("/", "layout");
}

/** OWNER session plus a live database role check. Duration is fixed at 30 minutes. */
export async function openPublicSiteAction() {
  await requireOwner();
  await openPublicSiteForThirtyMinutes(new Date());
  refreshPublicPages();
}

/** Ends the public window immediately. Does not move the countdown end date. */
export async function closePublicSiteAction() {
  await requireOwner();
  await closePublicSiteNow(new Date());
  refreshPublicPages();
}
