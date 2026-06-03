import { z } from "zod";

export const createRoomSchema = z.object({
  playerName: z.string().trim().min(1, "Name cannot be empty").max(20, "Name cannot exceed 20 characters")
});

export const joinRoomSchema = z.object({
  playerName: z.string().trim().min(1, "Name cannot be empty").max(20, "Name cannot exceed 20 characters")
});

export const roomCodeParamsSchema = z.object({
  code: z.string().regex(/^[a-zA-Z0-9]{6}$/, "Room code must be exactly 6 alphanumeric characters")
});

export const roomViewerQuerySchema = z.object({
  participantId: z.string().optional()
});

export const startGameSchema = z.object({
  participantId: z.string().min(1, "Participant ID is required")
});

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
