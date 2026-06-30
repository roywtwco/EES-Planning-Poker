export type Role = "admin" | "moderator" | "user";

export interface PlayerState {
  id: string;
  name: string;
  vote: string | null;
  role: Role;
  hasVoted: boolean;
}

export interface RoomState {
  id: string;
  name: string;
  players: PlayerState[];
  isRevealed: boolean;
  currentIssue: string;
}

export const CARD_VALUES = [
  "0",
  "1",
  "2",
  "3",
  "5",
  "8",
  "13",
  "21",
  "34",
  "?",
  "☕",
];
