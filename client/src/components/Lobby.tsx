import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

interface LobbyProps {
  onCreateRoom: (name: string, roomName: string) => void;
  onJoinRoom: (name: string, roomId: string) => void;
  error: string;
}

export default function Lobby({ onCreateRoom, onJoinRoom, error }: LobbyProps) {
  const [name, setName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [mode, setMode] = useState<"choice" | "create" | "join">("choice");

  // Auto-detect room ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      setRoomId(room);
      setMode("join");
    }
  }, []);

  return (
    <div className="lobby-container">
      <div className="lobby-theme-toggle">
        <ThemeToggle />
      </div>
      <div className="lobby-card">
        <div className="lobby-header">
          <span className="lobby-icon">🃏</span>
          <h1>Planning Poker</h1>
          <p className="lobby-subtitle">Estimate stories as a team</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {mode === "choice" && (
          <div className="lobby-choices">
            <button
              className="btn btn-primary btn-large"
              onClick={() => setMode("create")}
            >
              <span className="btn-icon">+</span>
              Create New Session
            </button>
            <div className="divider">
              <span>or</span>
            </div>
            <button
              className="btn btn-secondary btn-large"
              onClick={() => setMode("join")}
            >
              <span className="btn-icon">→</span>
              Join Existing Session
            </button>
          </div>
        )}

        {mode === "create" && (
          <form
            className="lobby-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) onCreateRoom(name.trim(), roomName.trim());
            }}
          >
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                maxLength={30}
              />
            </div>
            <div className="form-group">
              <label htmlFor="roomName">
                Session Name <span className="optional">(optional)</span>
              </label>
              <input
                id="roomName"
                type="text"
                placeholder="Sprint 42 Planning"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                maxLength={50}
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setMode("choice")}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!name.trim()}
              >
                Create Session
              </button>
            </div>
          </form>
        )}

        {mode === "join" && (
          <form
            className="lobby-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim() && roomId.trim())
                onJoinRoom(name.trim(), roomId.trim());
            }}
          >
            <div className="form-group">
              <label htmlFor="joinName">Your Name</label>
              <input
                id="joinName"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                maxLength={30}
              />
            </div>
            <div className="form-group">
              <label htmlFor="roomId">Room Code</label>
              <input
                id="roomId"
                type="text"
                placeholder="e.g. ABC123"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                maxLength={10}
                className="room-code-input"
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setMode("choice")}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!name.trim() || !roomId.trim()}
              >
                Join Session
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
