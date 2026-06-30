import { PlayerState } from "../types";

interface PokerTableProps {
  players: PlayerState[];
  isRevealed: boolean;
  socketId: string;
}

export default function PokerTable({
  players,
  isRevealed,
  socketId,
}: PokerTableProps) {
  return (
    <div className="poker-table-wrapper">
      <div className="poker-table">
        <div className="table-surface">
          <span className="table-label">
            {isRevealed ? "Votes Revealed!" : "Pick your cards"}
          </span>
        </div>
        <div className="players-around-table">
          {players.map((player) => (
            <div
              key={player.id}
              className={`table-player ${player.id === socketId ? "is-me" : ""}`}
            >
              <div
                className={`table-card-slot ${player.hasVoted ? "has-voted" : ""} ${isRevealed ? "revealed" : ""}`}
              >
                <div className="table-card-inner">
                  <div className="table-card-front">
                    {isRevealed && player.vote ? (
                      <span className="table-card-value">{player.vote}</span>
                    ) : null}
                  </div>
                  <div className="table-card-back">
                    <span className="card-back-pattern">✦</span>
                  </div>
                </div>
              </div>
              <div className="table-player-info">
                <div
                  className="player-avatar"
                  data-initial={player.name.charAt(0).toUpperCase()}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="player-name-label">
                  {player.name}
                  {player.role === "admin" && (
                    <span className="role-icon" title="Admin">
                      👑
                    </span>
                  )}
                  {player.role === "moderator" && (
                    <span className="role-icon" title="Moderator">
                      🛡️
                    </span>
                  )}
                </span>
                {!isRevealed && (
                  <span
                    className={`vote-indicator ${player.hasVoted ? "voted" : ""}`}
                  >
                    {player.hasVoted ? "✓" : "..."}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
