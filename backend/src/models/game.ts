export type ParticipantRole = "drawer" | "guesser";
export type RoomStatus = "lobby" | "playing" | "finished";

export interface Participant {
  id: string;
  name: string;
  joinedAt: string;
  lastActiveAt?: number; // UNIX timestamp (ms) of last poll
  isDrawer?: boolean;
}

export interface Room {
  code: string;
  status: RoomStatus;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
  secretWord?: string;
  wordLength?: number;
  drawerId?: string;
  roundNumber?: number;
}

export interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  participants: Participant[];
  availableWords: string[];
  roles: ParticipantRole[];
  hostId: string; // The ID of the host player
  secretWord?: string | null;
  wordLength?: number;
  drawerId?: string;
  roundNumber?: number;
}

export interface RoomSessionResponse {
  participantId: string;
  room: RoomSnapshot;
}
