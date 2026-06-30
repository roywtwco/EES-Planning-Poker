interface CardDeckProps {
  cards: string[];
  selectedCard: string | null;
  onSelect: (value: string) => void;
}

export default function CardDeck({
  cards,
  selectedCard,
  onSelect,
}: CardDeckProps) {
  return (
    <div className="card-deck-container">
      <p className="deck-label">Choose your estimate</p>
      <div className="card-deck">
        {cards.map((value) => (
          <button
            key={value}
            className={`poker-card ${selectedCard === value ? "selected" : ""}`}
            onClick={() => onSelect(value)}
          >
            <span className="card-value-top">{value}</span>
            <span className="card-value-center">{value}</span>
            <span className="card-value-bottom">{value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
