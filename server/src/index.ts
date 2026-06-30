import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(","),
    methods: ["GET", "POST"],
  },
});

// ── Types ───────────────────────────────────────────

type Role = "admin" | "moderator" | "user";

interface Player {
  id: string;
  name: string;
  vote: string | null;
  role: Role;
}

interface Room {
  id: string;
  name: string;
  players: Map<string, Player>;
  isRevealed: boolean;
  currentIssue: string;
}

// ── State ───────────────────────────────────────────

const rooms = new Map<string, Room>();

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRoomState(room: Room) {
  const players = Array.from(room.players.values()).map((p) => ({
    id: p.id,
    name: p.name,
    vote: room.isRevealed ? p.vote : p.vote !== null ? "hidden" : null,
    role: p.role,
    hasVoted: p.vote !== null,
  }));

  return {
    id: room.id,
    name: room.name,
    players,
    isRevealed: room.isRevealed,
    currentIssue: room.currentIssue,
  };
}

// ── Socket Events ───────────────────────────────────

io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.on("create-room", ({ playerName, roomName }, callback) => {
    const roomId = generateRoomId();
    const player: Player = {
      id: socket.id,
      name: playerName,
      vote: null,
      role: "admin",
    };

    const room: Room = {
      id: roomId,
      name: roomName || "Planning Poker",
      players: new Map([[socket.id, player]]),
      isRevealed: false,
      currentIssue: "",
    };

    rooms.set(roomId, room);
    socket.join(roomId);
    socket.data.roomId = roomId;

    callback({ success: true, roomId, roomState: getRoomState(room) });
    console.log(`Room ${roomId} created by ${playerName}`);
  });

  socket.on("join-room", ({ roomId, playerName }, callback) => {
    const room = rooms.get(roomId.toUpperCase());
    if (!room) {
      callback({ success: false, error: "Room not found" });
      return;
    }

    // Check for duplicate name
    const nameExists = Array.from(room.players.values()).some(
      (p) => p.name.toLowerCase() === playerName.toLowerCase(),
    );
    if (nameExists) {
      callback({ success: false, error: "Name already taken in this room" });
      return;
    }

    const player: Player = {
      id: socket.id,
      name: playerName,
      vote: null,
      role: "user",
    };

    room.players.set(socket.id, player);
    socket.join(room.id);
    socket.data.roomId = room.id;

    callback({ success: true, roomId: room.id, roomState: getRoomState(room) });
    socket.to(room.id).emit("room-updated", getRoomState(room));
    console.log(`${playerName} joined room ${room.id}`);
  });

  socket.on("vote", ({ value }) => {
    const roomId = socket.data.roomId as string | undefined;
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.isRevealed) return;
    const player = room.players.get(socket.id);
    if (!player) return;

    player.vote = value;
    io.to(roomId).emit("room-updated", getRoomState(room));
  });

  socket.on("reveal", () => {
    const roomId = socket.data.roomId as string | undefined;
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (!player || player.role === "user") return;

    room.isRevealed = true;
    io.to(roomId).emit("room-updated", getRoomState(room));
  });

  socket.on("reset", () => {
    const roomId = socket.data.roomId as string | undefined;
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (!player || player.role === "user") return;

    room.isRevealed = false;
    room.players.forEach((p) => {
      p.vote = null;
    });
    io.to(roomId).emit("room-updated", getRoomState(room));
  });

  socket.on("set-issue", ({ issue }) => {
    const roomId = socket.data.roomId as string | undefined;
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (!player || player.role !== "admin") return;

    room.currentIssue = issue;
    io.to(roomId).emit("room-updated", getRoomState(room));
  });

  socket.on(
    "change-role",
    ({ targetId, newRole }: { targetId: string; newRole: Role }) => {
      const roomId = socket.data.roomId as string | undefined;
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room) return;
      const player = room.players.get(socket.id);
      if (!player || player.role !== "admin") return;
      if (targetId === socket.id) return; // Can't change own role
      const target = room.players.get(targetId);
      if (!target) return;
      if (!["admin", "moderator", "user"].includes(newRole)) return;

      target.role = newRole;
      io.to(roomId).emit("room-updated", getRoomState(room));
    },
  );

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId as string | undefined;
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;

    room.players.delete(socket.id);

    if (room.players.size === 0) {
      rooms.delete(roomId);
      console.log(`Room ${roomId} deleted (empty)`);
    } else {
      // Reassign admin if needed
      const hasAdmin = Array.from(room.players.values()).some(
        (p) => p.role === "admin",
      );
      if (!hasAdmin) {
        // Promote a moderator first, then any user
        const moderator = Array.from(room.players.values()).find(
          (p) => p.role === "moderator",
        );
        const first = moderator || room.players.values().next().value;
        if (first) first.role = "admin";
      }
      io.to(roomId).emit("room-updated", getRoomState(room));
    }
    console.log(`Disconnected: ${socket.id}`);
  });
});

// ── Static files (production) ───────────────────────

app.use(express.static(path.join(__dirname, "../../client/dist")));
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

// ── Start ───────────────────────────────────────────

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Planning Poker server running on http://localhost:${PORT}`);
});
