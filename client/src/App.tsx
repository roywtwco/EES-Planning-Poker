import { useState, useEffect, useCallback } from "react";
import { socket } from "./socket";
import { RoomState } from "./types";
import Lobby from "./components/Lobby";
import Room from "./components/Room";

export default function App() {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    socket.connect();

    socket.on("room-updated", (state: RoomState) => {
      setRoomState(state);
    });

    return () => {
      socket.off("room-updated");
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback((name: string, roomName: string) => {
    setError("");
    setPlayerName(name);
    socket.emit(
      "create-room",
      { playerName: name, roomName },
      (res: {
        success: boolean;
        roomId?: string;
        roomState?: RoomState;
        error?: string;
      }) => {
        if (res.success && res.roomState) {
          setRoomState(res.roomState);
          window.history.replaceState(null, "", `?room=${res.roomId}`);
        } else {
          setError(res.error || "Failed to create room");
        }
      },
    );
  }, []);

  const joinRoom = useCallback((name: string, roomId: string) => {
    setError("");
    setPlayerName(name);
    socket.emit(
      "join-room",
      { roomId, playerName: name },
      (res: {
        success: boolean;
        roomId?: string;
        roomState?: RoomState;
        error?: string;
      }) => {
        if (res.success && res.roomState) {
          setRoomState(res.roomState);
          window.history.replaceState(null, "", `?room=${res.roomId}`);
        } else {
          setError(res.error || "Failed to join room");
        }
      },
    );
  }, []);

  if (!roomState) {
    return (
      <Lobby onCreateRoom={createRoom} onJoinRoom={joinRoom} error={error} />
    );
  }

  const currentPlayer = roomState.players.find((p) => p.id === socket.id);
  const myRole = currentPlayer?.role ?? "user";

  return (
    <Room
      roomState={roomState}
      playerName={playerName}
      myRole={myRole}
      myVote={currentPlayer?.hasVoted ? currentPlayer.vote : null}
      socketId={socket.id!}
    />
  );
}
