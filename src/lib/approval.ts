import { createHmac, timingSafeEqual } from "crypto";

export type ApprovalAction = "approve" | "reject";

// Signs "reservationId:action" so only links from the email work.
export function signApproval(reservationId: number, action: ApprovalAction) {
  return createHmac("sha256", process.env.APPROVAL_SECRET!)
    .update(`${reservationId}:${action}`)
    .digest("hex");
}

export function verifyApproval(reservationId: number, action: ApprovalAction, token: string) {
  const expected = Buffer.from(signApproval(reservationId, action));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function approvalUrl(reservationId: number, action: ApprovalAction) {
  const token = signApproval(reservationId, action);
  return `${process.env.APP_URL}/api/reservations/${reservationId}/${action}?token=${token}`;
}
