import { socket } from "../socket";
import { PlayerState, Role } from "../types";

interface PlayerListProps {
  players: PlayerState[];
  socketId: string;
}

const ROLE_OPTIONS: { value: Role; label: string; icon: string }[] = [
  { value: "admin", label: "Admin", icon: "👑" },
  { value: "moderator", label: "Moderator", icon: "🛡️" },
  { value: "user", label: "User", icon: "👤" },
];

export default function PlayerList({ players, socketId }: PlayerListProps) {
  const handleRoleChange = (targetId: string, newRole: Role) => {
    socket.emit("change-role", { targetId, newRole });
  };

  return (
    <div className="player-list-container">
      <h3 className="player-list-title">Manage Players</h3>
      <div className="player-list">
        {players.map((player) => {
          const isMe = player.id === socketId;
          return (
            <div
              key={player.id}
              className={`player-list-item ${isMe ? "is-me" : ""}`}
            >
              <div className="player-list-info">
                <div
                  className="player-avatar-small"
                  data-initial={player.name.charAt(0).toUpperCase()}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="player-list-name">
                  {player.name}
                  {isMe && <span className="you-label">(you)</span>}
                </span>
              </div>
              {isMe ? (
                <span className="role-badge-fixed" data-role={player.role}>
                  {ROLE_OPTIONS.find((r) => r.value === player.role)?.icon}{" "}
                  {ROLE_OPTIONS.find((r) => r.value === player.role)?.label}
                </span>
              ) : (
                <select
                  className="role-select"
                  value={player.role}
                  onChange={(e) =>
                    handleRoleChange(player.id, e.target.value as Role)
                  }
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
