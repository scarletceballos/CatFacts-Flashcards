import { useState, useEffect } from "react";
import "./App.css"

import sleepImg from "./assets/cards/sleepimg.jpg";
import purrImg from "./assets/cards/purrimg.jpg";
import clowderImg from "./assets/cards/clowderimg.JPG";
import pawImg from "./assets/cards/pawimg.jpg";
import candyImg from "./assets/cards/candyimg.jpg";
import kittenImg from "./assets/cards/kittenimg.jpg";
import kneadImg from "./assets/cards/kneadimg.jpg";
import runImg from "./assets/cards/runimg.jpg";
import smellImg from "./assets/cards/smellimg.jpg";
import earsImg from "./assets/cards/earsimg.jpg";

const cards = [
  {
    question: "How many hours a day do cats sleep?",
    answer: "Cats sleep 12 to 16 hours a day on average.",
    emoji: "😴",
    image: sleepImg,
    difficulty: "Easy",
    keywords: ["12 to 16", "12 16", "16 hours"],
  },
  {
    question: "Why do cats purr?",
    answer: "Cats purr to show contentment, but also to soothe themselves when hurt or anxious.",
    emoji: "😻",
    image: purrImg,
    difficulty: "Medium",
    keywords: ["content", "contentment", "happy", "soothe", "comfort", "relax"],
  },
  {
    question: "What is a group of cats called?",
    answer: "A group of cats is called a clowder.",
    emoji: "🐈‍⬛",
    image: clowderImg,
    difficulty: "Hard",
    keywords: ["clowder"],
  },
  {
    question: "How many toes does a cat usually have?",
    answer: "Cats usually have 18 toes: five on each front paw and four on each back paw.",
    emoji: "🐾",
    image: pawImg,
    difficulty: "Medium",
    keywords: ["18", "eighteen"],
  },
  {
    question: "Can cats taste sweetness?",
    answer: "No, cats lack the taste receptor for sweetness.",
    emoji: "🍬",
    image: candyImg,
    difficulty: "Hard",
    keywords: ["no", "nope", "cant", "cannot", "can t"],
  },
  {
    question: "What is a baby cat called?",
    answer: "A baby cat is called a kitten.",
    emoji: "🐱",
    image: kittenImg,
    difficulty: "Easy",
    keywords: ["kitten"],
  },
  {
    question: "Why do cats knead with their paws?",
    answer: "Kneading is a comforting behavior left over from kittenhood, when kneading stimulated milk flow.",
    emoji: "🐈",
    image: kneadImg,
    difficulty: "Hard",
    keywords: ["milk", "kitten", "kittenhood", "comfort", "comforting", "nursing"],
  },
  {
    question: "How fast can a house cat run?",
    answer: "A house cat can run up to about 30 miles per hour.",
    emoji: "💨",
    image: runImg,
    difficulty: "Easy",
    keywords: ["30", "thirty"],
  },
  {
    question: "Do cats have a sense of smell better than humans?",
    answer: "Yes, a cat's sense of smell is about 14 times stronger than a human's.",
    emoji: "👃",
    image: smellImg,
    difficulty: "Medium",
    keywords: ["yes", "14", "fourteen"],
  },
  {
    question: "What is it called when a cat's ears are flattened?",
    answer: "It's called airplane ears, and usually signals fear, anger, or annoyance.",
    emoji: "😾",
    image: earsImg,
    difficulty: "Medium",
    keywords: ["airplane", "fear", "angry", "anger", "annoyed", "annoyance", "scared"],
  },
];

const SWIPE_DURATION = 300;
const MAX_ATTEMPTS = 3;
const FILTERS = ["All", "Easy", "Medium", "Hard"];
const ALL_INDICES = cards.map((_, index) => index);

// Lowercase, turn punctuation into spaces, collapse whitespace.
function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

// Correct if the guess equals the full answer, or contains any keyword as a whole word/phrase.
function isCorrectGuess(guess, card) {
  const cleaned = normalize(guess);
  if (!cleaned) return false;
  if (cleaned === normalize(card.answer)) return true;

  const padded = ` ${cleaned} `;
  return card.keywords.some((keyword) => padded.includes(` ${normalize(keyword)} `));
}

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function App() {
  const [order, setOrder] = useState(ALL_INDICES); // sequence of card indices; reshuffled on demand
  const [mastered, setMastered] = useState([]); // card indices removed from the pool
  const [currentIndex, setCurrentIndex] = useState(0); // position within the visible deck
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeState, setSwipeState] = useState("idle"); // idle | next-out | next-in | back-out | back-in
  const [filter, setFilter] = useState("All");
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState(null); // null | "correct" | "incorrect"
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0); // guesses used on the current card
  const [totalGuesses, setTotalGuesses] = useState(0);
  const [correctGuesses, setCorrectGuesses] = useState(0);

  const deck = order.filter(
    (index) =>
      !mastered.includes(index) && (filter === "All" || cards[index].difficulty === filter)
  );
  const card = deck.length > 0 ? cards[deck[currentIndex]] : null;
  const difficultyClass = card ? `difficulty-${card.difficulty.toLowerCase()}` : "";
  const canGoBack = currentIndex > 0;
  const canGoNext = currentIndex < deck.length - 1;
  const attemptsLeft = MAX_ATTEMPTS - attempts;
  // The answer is revealed once the guess is right or the guesses run out
  const hasAnswered = feedback === "correct" || attemptsLeft <= 0;
  const accuracy = totalGuesses > 0 ? Math.round((correctGuesses / totalGuesses) * 100) : null;
  const masteredPercent = Math.round((mastered.length / cards.length) * 100);
  const hintWord = card ? card.keywords[0] : "";

  function resetCardState() {
    setIsFlipped(false);
    setGuess("");
    setFeedback(null);
    setShowHint(false);
    setAttempts(0);
  }

  function handleCardClick() {
    if (swipeState !== "idle" || !card || !hasAnswered) return;
    setIsFlipped(!isFlipped);
  }

  function handleNextCard() {
    if (swipeState !== "idle" || !canGoNext) return;
    setSwipeState("next-out");

    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      resetCardState();
      setSwipeState("next-in");

      setTimeout(() => setSwipeState("idle"), SWIPE_DURATION);
    }, SWIPE_DURATION);
  }

  function handleBackCard() {
    if (swipeState !== "idle" || !canGoBack) return;
    setSwipeState("back-out");

    setTimeout(() => {
      setCurrentIndex(currentIndex - 1);
      resetCardState();
      setSwipeState("back-in");

      setTimeout(() => setSwipeState("idle"), SWIPE_DURATION);
    }, SWIPE_DURATION);
  }

  function handleFilterChange(newFilter) {
    if (swipeState !== "idle" || newFilter === filter) return;
    setFilter(newFilter);
    setCurrentIndex(0);
    resetCardState();
  }

  function handleShuffle() {
    if (swipeState !== "idle") return;
    setOrder(shuffle(ALL_INDICES));
    setCurrentIndex(0);
    resetCardState();
  }

  function handleGuessChange(event) {
    setGuess(event.target.value);
    if (feedback === "incorrect") setFeedback(null);
  }

  function handleSubmitGuess(event) {
    event.preventDefault();
    if (!card || hasAnswered || !guess.trim()) return;

    setTotalGuesses(totalGuesses + 1);
    setAttempts(attempts + 1);

    if (isCorrectGuess(guess, card)) {
      const newStreak = streak + 1;
      setIsFlipped(true);
      setFeedback("correct");
      setCorrectGuesses(correctGuesses + 1);
      setStreak(newStreak);
      setLongestStreak(Math.max(longestStreak, newStreak));
    } else {
      setFeedback("incorrect");
      setStreak(0);
      if (attemptsLeft - 1 <= 0) setIsFlipped(true);
    }
  }

  function handleMaster() {
    if (swipeState !== "idle" || !card) return;
    setMastered([...mastered, deck[currentIndex]]);
    setCurrentIndex(Math.max(0, Math.min(currentIndex, deck.length - 2)));
    resetCardState();
  }

  function handleUnmaster(cardIndex) {
    setMastered(mastered.filter((index) => index !== cardIndex));
    setCurrentIndex(0);
    resetCardState();
  }

  useEffect(() => {
    function handleKeyDown(event) {
      const tag = event.target.tagName;
      if (tag === "INPUT") return; // let the user type freely

      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNextCard();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleBackCard();
      } else if ((event.key === " " || event.key === "Enter") && tag !== "BUTTON") {
        event.preventDefault();
        handleCardClick();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="app">
      <h1>🐈 Cat Facts 🐈‍⬛</h1>

      <p className="description">
        What do you know about your meowy fluffy friend?
      </p>

      <p className="card-count">
        {card ? `Card ${currentIndex + 1} of ${deck.length}` : "No cards left"}
        {` · Total: ${cards.length}`}
        {filter !== "All" && ` · Showing ${filter}`}
      </p>

      <div className="filter-row">
        {FILTERS.map((filterOption) => (
          <button
            key={filterOption}
            className={`filter-button ${filterOption !== "All" ? `difficulty-${filterOption.toLowerCase()}` : ""} ${filter === filterOption ? "active" : ""}`}
            onClick={() => handleFilterChange(filterOption)}
          >
            {filterOption}
          </button>
        ))}

        <button className="filter-button shuffle-button" onClick={handleShuffle}>
          🔀 Shuffle
        </button>
      </div>

      <p className="score-summary streak-summary">
        🔥 Current streak: {streak} &nbsp;·&nbsp; 🏆 Longest streak: {longestStreak}
      </p>

      <div className="progress-section">
        <div className="progress-bar" role="progressbar" aria-valuenow={masteredPercent} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${masteredPercent}%` }} />
        </div>
        <p className="progress-text">
          ⭐ {mastered.length} of {cards.length} mastered
          {accuracy !== null && ` · 🎯 Accuracy: ${accuracy}% (${correctGuesses}/${totalGuesses})`}
        </p>
      </div>

      {card ? (
        <>
          <div className={`flashcard-wrapper ${swipeState !== "idle" ? `swipe-${swipeState}` : ""}`}>
            <div
              className={`flashcard ${difficultyClass} ${isFlipped ? "flipped" : ""}`}
              onClick={handleCardClick}
            >
              <div className="flashcard-inner">
                <div className={`card-face card-front ${difficultyClass}`}>
                  <span className={`difficulty-badge ${difficultyClass}`}>
                    {card.difficulty}
                  </span>

                  {card.image ? (
                    <img className={`card-photo ${difficultyClass}`} src={card.image} alt="" />
                  ) : (
                    <span className="card-emoji">{card.emoji}</span>
                  )}

                  <span className="card-label">{card.emoji} Question</span>

                  <h2>{card.question}</h2>

                  <p className="flip-instruction">
                    {hasAnswered ? "Click to reveal the paw-some answer" : "Guess to reveal the answer"}
                  </p>
                </div>

                <div className={`card-face card-back ${difficultyClass}`}>
                  <span className={`difficulty-badge ${difficultyClass}`}>
                    {card.difficulty}
                  </span>

                  {card.image ? (
                    <img className={`card-photo ${difficultyClass}`} src={card.image} alt="" />
                  ) : (
                    <span className="card-emoji">{card.emoji}</span>
                  )}

                  <span className="card-label">🐈 Answer</span>

                  <h2>{card.answer}</h2>

                  <p className="flip-instruction">Click to see the question</p>
                </div>
              </div>
            </div>
          </div>

          <form className="guess-form" onSubmit={handleSubmitGuess}>
            <label htmlFor="guess-input" className="guess-label">
              Your guess · {hasAnswered ? "no guesses left" : `${attemptsLeft} of ${MAX_ATTEMPTS} guesses left`}
            </label>
            <div className="guess-row">
              <input
                id="guess-input"
                type="text"
                className={`guess-input ${feedback ?? ""}`}
                value={guess}
                onChange={handleGuessChange}
                disabled={hasAnswered}
                placeholder="Type your answer..."
                autoComplete="off"
              />
              <button
                type="submit"
                className="submit-button"
                disabled={!guess.trim() || hasAnswered}
              >
                Submit
              </button>
            </div>

            <div className="hint-row">
              <button
                type="button"
                className="hint-button"
                onClick={() => setShowHint(true)}
                disabled={showHint || hasAnswered}
              >
                💡 Hint
              </button>
              {showHint && (
                <span className="hint-text">
                  Try a word that starts with "{hintWord[0].toUpperCase()}" ({hintWord.length} characters)
                </span>
              )}
            </div>

            {feedback === "correct" && (
              <p className="feedback feedback-correct">✅ Correct! Purr-fect!</p>
            )}
            {feedback === "incorrect" && (
              <p className="feedback feedback-incorrect">{hasAnswered
                  ? "❌ Out of guesses — check the answer on the card!"
                  : `❌ Not quite — ${attemptsLeft} ${attemptsLeft === 1 ? "guess" : "guesses"} left.`}</p>
            )}
          </form>

          <div className="know-row">
            <button className="known-button" onClick={handleMaster}>
              ⭐ Mark as mastered
            </button>
          </div>
        </>
      ) : (
        <p className="empty-message">
          {mastered.length === cards.length
            ? "🎉 You mastered every card!"
            : "No cards to show here. Try another filter or restore a mastered card."}
        </p>
      )}

      <div className="button-row">
        <button
          className="back-button"
          onClick={handleBackCard}
          disabled={!canGoBack}
        >
          🐾 Back
        </button>

        <button
          className="next-button"
          onClick={handleNextCard}
          disabled={!canGoNext}
        >
          Next Card 🐾
        </button>
      </div>

      {mastered.length > 0 && (
        <div className="mastered-list">
          <h3>⭐ Mastered ({mastered.length})</h3>
          <ul>
            {mastered.map((cardIndex) => (
              <li key={cardIndex}>
                <span>{cards[cardIndex].emoji} {cards[cardIndex].question}</span>
                <button onClick={() => handleUnmaster(cardIndex)}>Restore</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
