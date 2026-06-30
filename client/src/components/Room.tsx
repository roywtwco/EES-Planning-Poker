import { useState } from "react";
import { socket } from "../socket";
import { RoomState, CARD_VALUES, Role } from "../types";
import CardDeck from "./CardDeck";
import PokerTable from "./PokerTable";
import VoteResults from "./VoteResults";
import PlayerList from "./PlayerList";
import ThemeToggle from "./ThemeToggle";

interface RoomProps {
  roomState: RoomState;
  playerName: string;
  myRole: Role;
  myVote: string | null;
  socketId: string;
}

export default function Room({
  roomState,
  myRole,
  myVote,
  socketId,
}: RoomProps) {
  const [issueInput, setIssueInput] = useState(roomState.currentIssue);
  const [copied, setCopied] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const totalPlayers = roomState.players.length;
  const votedCount = roomState.players.filter((p) => p.hasVoted).length;

  const handleVote = (value: string) => {
    if (roomState.isRevealed) return;
    const newValue = selectedCard === value ? null : value;
    setSelectedCard(newValue);
    socket.emit("vote", { value: newValue });
  };

  const handleReveal = () => socket.emit("reveal");

  const handleReset = () => {
    setSelectedCard(null);
    socket.emit("reset");
  };

  const handleSetIssue = () => {
    socket.emit("set-issue", { issue: issueInput });
  };

  const copyInviteLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomState.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset selected card when round is reset
  if (!roomState.isRevealed && myVote === null && selectedCard !== null) {
    // Server has reset, clear local selection
    setSelectedCard(null);
  }

  const isAdmin = myRole === "admin";
  const canReveal = myRole === "admin" || myRole === "moderator";

  return (
    <div className="room-container">
      {/* Header */}
      <header className="room-header">
        <div className="room-header-left">
          <span className="room-logo">🃏</span>
          <div>
            <h1 className="room-title">{roomState.name}</h1>
            <span className="room-id">Room: {roomState.id}</span>
          </div>
        </div>
        <div className="room-header-right">
          <span className="role-badge" data-role={myRole}>
            {myRole === "admin"
              ? "👑 Admin"
              : myRole === "moderator"
                ? "🛡️ Moderator"
                : "👤 User"}
          </span>
          <span className="player-count">
            {totalPlayers} player{totalPlayers !== 1 ? "s" : ""}
          </span>
          <button
            className="btn btn-secondary btn-small"
            onClick={copyInviteLink}
          >
            {copied ? "✓ Copied!" : "📋 Copy Invite Link"}
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Issue bar */}
      {isAdmin ? (
        <div className="issue-bar">
          <label className="issue-label">Estimating:</label>
          <input
            type="text"
            className="issue-input"
            placeholder="Enter story or issue title..."
            value={issueInput}
            onChange={(e) => setIssueInput(e.target.value)}
            onBlur={handleSetIssue}
            onKeyDown={(e) => e.key === "Enter" && handleSetIssue()}
          />
        </div>
      ) : roomState.currentIssue ? (
        <div className="issue-bar">
          <label className="issue-label">Estimating:</label>
          <span className="issue-text">{roomState.currentIssue}</span>
        </div>
      ) : null}

      {/* Main content */}
      <div className="room-main">
        <PokerTable
          players={roomState.players}
          isRevealed={roomState.isRevealed}
          socketId={socketId}
        />
      </div>

      {/* Vote status & actions */}
      <div className="action-bar">
        <div className="vote-progress">
          <div className="vote-progress-bar">
            <div
              className="vote-progress-fill"
              style={{
                width: `${totalPlayers > 0 ? (votedCount / totalPlayers) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="vote-progress-text">
            {votedCount} / {totalPlayers} voted
          </span>
        </div>

        {canReveal && (
          <div className="action-buttons">
            {!roomState.isRevealed ? (
              <button
                className="btn btn-primary"
                onClick={handleReveal}
                disabled={votedCount === 0}
              >
                👁 Reveal Votes
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleReset}>
                🔄 New Round
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {roomState.isRevealed && <VoteResults players={roomState.players} />}

      {/* Card deck */}
      {!roomState.isRevealed && (
        <CardDeck
          cards={CARD_VALUES}
          selectedCard={selectedCard}
          onSelect={handleVote}
        />
      )}

      {/* Player management (admin only) */}
      {isAdmin && (
        <PlayerList players={roomState.players} socketId={socketId} />
      )}
    </div>
  );
}
