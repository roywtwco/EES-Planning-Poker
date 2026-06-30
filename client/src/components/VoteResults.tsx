import { PlayerState } from "../types";

interface VoteResultsProps {
  players: PlayerState[];
}

export default function VoteResults({ players }: VoteResultsProps) {
  const votes = players
    .filter((p) => p.vote && p.vote !== "?" && p.vote !== "☕")
    .map((p) => parseFloat(p.vote!))
    .filter((v) => !isNaN(v));

  const allVotes = players.filter((p) => p.vote !== null);

  if (allVotes.length === 0) {
    return (
      <div className="vote-results">
        <p className="no-votes">No votes were cast</p>
      </div>
    );
  }

  const average =
    votes.length > 0 ? votes.reduce((a, b) => a + b, 0) / votes.length : null;
  const min = votes.length > 0 ? Math.min(...votes) : null;
  const max = votes.length > 0 ? Math.max(...votes) : null;
  const consensus = votes.length > 0 && new Set(votes).size === 1;

  // Group votes for distribution
  const voteCounts = new Map<string, number>();
  allVotes.forEach((p) => {
    const v = p.vote!;
    voteCounts.set(v, (voteCounts.get(v) || 0) + 1);
  });
  const maxCount = Math.max(...voteCounts.values());

  return (
    <div className="vote-results">
      <div className="results-header">
        <h3>Results</h3>
        {consensus && <span className="consensus-badge">🎯 Consensus!</span>}
      </div>

      <div className="results-stats">
        {average !== null && (
          <div className="stat">
            <span className="stat-value">{average.toFixed(1)}</span>
            <span className="stat-label">Average</span>
          </div>
        )}
        {min !== null && (
          <div className="stat">
            <span className="stat-value">{min}</span>
            <span className="stat-label">Min</span>
          </div>
        )}
        {max !== null && (
          <div className="stat">
            <span className="stat-value">{max}</span>
            <span className="stat-label">Max</span>
          </div>
        )}
        <div className="stat">
          <span className="stat-value">{allVotes.length}</span>
          <span className="stat-label">Votes</span>
        </div>
      </div>

      <div className="vote-distribution">
        {Array.from(voteCounts.entries())
          .sort(([a], [b]) => {
            const na = parseFloat(a);
            const nb = parseFloat(b);
            if (isNaN(na) && isNaN(nb)) return a.localeCompare(b);
            if (isNaN(na)) return 1;
            if (isNaN(nb)) return -1;
            return na - nb;
          })
          .map(([value, count]) => (
            <div key={value} className="distribution-bar-group">
              <div className="distribution-bar-wrapper">
                <div
                  className="distribution-bar"
                  style={{ height: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="distribution-value">{value}</span>
              <span className="distribution-count">
                {count} vote{count !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
