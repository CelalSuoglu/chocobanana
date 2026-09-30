import "server-only";
import { requirePrisma } from "@/lib/db";
import {
  claimRewardCode,
  customerRewardView,
  reconcileCustomerRewards,
  releaseRewardReservationById,
  releaseRewardReservationForSession,
  rewardSnapshotsForUsers,
} from "@/lib/rewards/engine";

export function reconcileRewardsForUser(userId: string) {
  return reconcileCustomerRewards(requirePrisma(), userId);
}

export function claimRewardForCheckout(options: {
  code: string;
  userId: string | null;
}) {
  return claimRewardCode(requirePrisma(), options);
}

export function releaseRewardById(rewardCodeId: string) {
  return releaseRewardReservationById(requirePrisma(), rewardCodeId);
}

export function releaseRewardForCheckoutSession(checkoutSessionId: string) {
  return releaseRewardReservationForSession(requirePrisma(), checkoutSessionId);
}

export function getCustomerRewardView(userId: string) {
  return customerRewardView(requirePrisma(), userId);
}

export function getRewardSnapshots(userIds: string[]) {
  return rewardSnapshotsForUsers(requirePrisma(), userIds);
}
