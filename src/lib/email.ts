import { Resend } from "resend";
import { approvalUrl } from "@/lib/approval";

type ReservationEmail = {
  reservationId: number;
  userEmail: string;
  toyId: number;
  toyName: string;
  lendingDays: number;
};

// Tells the team a toy was requested, with approve/reject links.
export async function sendReservationEmail(r: ReservationEmail) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.RESERVATION_NOTIFY_EMAIL!,
    subject: `New toy request: ${r.toyName}`,
    text: [
      `${r.userEmail} requested a toy.`,
      ``,
      `Toy: ${r.toyName} (id ${r.toyId})`,
      `Lending period: ${r.lendingDays} days`,
      `Reservation id: ${r.reservationId}`,
      ``,
      `Approve: ${approvalUrl(r.reservationId, "approve")}`,
      `Reject:  ${approvalUrl(r.reservationId, "reject")}`,
    ].join("\n"),
  });

  if (error) throw new Error(error.message);
}
