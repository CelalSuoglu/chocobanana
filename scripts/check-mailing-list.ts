import { PrismaClient } from "@prisma/client";
import {
  confirmMailingList,
  joinMailingList,
  unsubscribeMailingList,
} from "../lib/mailing/service";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error(label);
}

async function main() {
  const prisma = new PrismaClient();
  const email = `list-check-${Date.now()}@example.com`;
  const usersBefore = await prisma.user.count();
  let verifyToken = "";
  let unsubscribeToken = "";
  let sends = 0;

  const send = async () => {
    sends += 1;
  };
  const failSend = async () => {
    throw new Error("send_failed");
  };

  try {
    const noConsent = await joinMailingList(
      prisma,
      {
        email,
        firstName: "Ada",
        marketingOptIn: false,
        verification: () => ({ subject: "s", text: "t", html: "h" }),
      },
      send,
    );
    assert(!noConsent.ok && noConsent.reason === "consent", "consent_required");
    assert((await prisma.emailSubscriber.count({ where: { email } })) === 0, "no_row_without_consent");

    const failed = await joinMailingList(
      prisma,
      {
        email,
        marketingOptIn: true,
        verification: (token) => {
          verifyToken = token;
          return { subject: "s", text: "t", html: "h" };
        },
      },
      failSend,
    );
    assert(!failed.ok && failed.reason === "send", "failed_send");
    assert((await prisma.emailSubscriber.count({ where: { email } })) === 0, "failed_send_adds_nothing");

    sends = 0;
    const joined = await joinMailingList(
      prisma,
      {
        email,
        firstName: "Ada",
        marketingOptIn: true,
        verification: (token) => {
          verifyToken = token;
          return { subject: "Confirm", text: "t", html: "h" };
        },
      },
      send,
    );
    assert(joined.ok, "join_ok");
    assert(sends === 1, "verification_sent_once");
    assert((await prisma.user.count()) === usersBefore, "no_account_created");
    const row = await prisma.emailSubscriber.findUnique({ where: { email } });
    assert(row?.status === "PENDING" && row.marketingOptIn, "pending_with_consent");

    const again = await joinMailingList(
      prisma,
      {
        email,
        marketingOptIn: true,
        verification: () => ({ subject: "s", text: "t", html: "h" }),
      },
      send,
    );
    assert(!again.ok && again.reason === "pending", "no_duplicate_row");
    assert((await prisma.emailSubscriber.count({ where: { email } })) === 1, "still_one_row");

    sends = 0;
    const confirmed = await confirmMailingList(
      prisma,
      verifyToken,
      (welcome) => {
        unsubscribeToken = welcome.unsubscribeToken;
        return { subject: "Welcome", text: "t", html: "h" };
      },
      send,
    );
    assert(confirmed.ok && confirmed.welcomed, "welcome_sent");
    assert(sends === 1, "welcome_once");
    const confirmedRow = await prisma.emailSubscriber.findUnique({ where: { email } });
    assert(confirmedRow?.status === "CONFIRMED" && confirmedRow.welcomeEmailSentAt != null, "confirmed");

    sends = 0;
    const second = await confirmMailingList(
      prisma,
      verifyToken,
      () => ({ subject: "Welcome", text: "t", html: "h" }),
      send,
    );
    assert(!second.ok, "confirm_link_cannot_send_welcome_twice");
    assert(sends === 0, "no_second_welcome");

    assert(await unsubscribeMailingList(prisma, unsubscribeToken), "unsubscribed");
    const gone = await prisma.emailSubscriber.findUnique({ where: { email } });
    assert(gone?.status === "UNSUBSCRIBED" && gone.marketingOptIn === false, "opt_out_saved");
    console.log(JSON.stringify({ ok: true, sendsAfterUnsubscribe: sends }));
  } finally {
    await prisma.emailSubscriber.deleteMany({ where: { email } });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "mailing check failed");
  process.exit(1);
});
