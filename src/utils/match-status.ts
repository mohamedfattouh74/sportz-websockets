import { updateStatus } from "../dal/match.ts";
import type { Match, matchStatusEnum } from "../db/schema.ts";

export function getMatchStatus(startTime: Date, endTime: Date): typeof matchStatusEnum.enumValues[number] {
  const now = new Date();

  if (now < startTime) {
    return 'scheduled';
  }
  if (now >= endTime) {
    return 'finished';
  }
  return 'live';
}


export async function syncMatchStatus(match: Match, status: typeof matchStatusEnum.enumValues[number]) {
  if(!match.startTime || !match.endTime) {
    return;
  }
  const nextStatus = getMatchStatus(match.startTime, match.endTime);
  if(!nextStatus) {
    return match.status;
  }
  if(match.status !== nextStatus) {
    await updateStatus(match.id, nextStatus);
    match.status = nextStatus;
  }
  return match.status;
}