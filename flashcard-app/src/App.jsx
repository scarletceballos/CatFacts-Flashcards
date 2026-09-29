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
  },
  {
    question: "Why do cats purr?",
    answer: "Cats purr to show contentment, but also to soothe themselves when hurt or anxious.",
    emoji: "😻",
    image: purrImg,
    difficulty: "Medium",
  },
  {
    question: "What is a group of cats called?",
    answer: "A group of cats is called a clowder.",
    emoji: "🐈‍⬛",
    image: clowderImg,
    difficulty: "Hard",
  },
  {
    question: "How many toes does a cat usually have?",
    answer: "Cats usually have 18 toes: five on each front paw and four on each back paw.",
    emoji: "🐾",
    image: pawImg,
    difficulty: "Medium",
  },
  {
    question: "Can cats taste sweetness?",
    answer: "No, cats lack the taste receptor for sweetness.",
    emoji: "🍬",
    image: candyImg,
    difficulty: "Hard",
  },
  {
    question: "What is a baby cat called?",
    answer: "A baby cat is called a kitten.",
    emoji: "🐱",
    image: kittenImg,
    difficulty: "Easy",
  },
  {
    question: "Why do cats knead with their paws?",
    answer: "Kneading is a comforting behavior left over from kittenhood, when kneading stimulated milk flow.",
    emoji: "🐈",
    image: kneadImg,
    difficulty: "Hard",
  },
  {
    question: "How fast can a house cat run?",
    answer: "A house cat can run up to about 30 miles per hour.",
    emoji: "💨",
    image: runImg,
    difficulty: "Easy",
  },
  {
    question: "Do cats have a sense of smell better than humans?",
    answer: "Yes, a cat's sense of smell is about 14 times stronger than a human's.",
    emoji: "👃",
    image: smellImg,
    difficulty: "Medium",
  },
  {
    question: "What is it called when a cat's ears are flattened?",
    answer: "It's called airplane ears, and usually signals fear, anger, or annoyance.",
    emoji: "😾",
    image: earsImg,
    difficulty: "Medium",
  },
];

const SWIPE_DURATION = 300;
const FILTERS = ["All", "Easy", "Medium", "Hard"];

function getFilteredIndices(filter) {
  return cards
    .map((_, index) => index)
    .filter((index) => filter === "All" || cards[index].difficulty === filter);
}

function App() {
  const [history, setHistory] = useState([0]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeState, setSwipeState] = useState("idle"); // idle | next-out | next-in | back-out | back-in
  const [filter, setFilter] = useState("All");
  const [progress, setProgress] = useState({}); // { [cardIndex]: "known" | "learning" }

  const currentCard = history[historyIndex];
  const card = cards[currentCard];
  const difficultyClass = `difficulty-${card.difficulty.toLowerCase()}`;
  const canGoBack = historyIndex > 0;
  const filteredIndices = getFilteredIndices(filter);

  const knownCount = Object.values(progress).filter((status) => status === "known").length;
  const learningCount = Object.values(progress).filter((status) => status === "learning").length;

  function handleCardClick() {
    if (swipeState !== "idle") return;
    setIsFlipped(!isFlipped);
  }

  function handleNextCard() {
    if (swipeState !== "idle") return;
    setSwipeState("next-out");

    setTimeout(() => {
      if (historyIndex < history.length - 1) {
        setHistoryIndex(historyIndex + 1);
      } else {
        const randomIndex = filteredIndices[Math.floor(Math.random() * filteredIndices.length)];
        setHistory([...history, randomIndex]);
        setHistoryIndex(history.length);
      }
      setIsFlipped(false);
      setSwipeState("next-in");

      setTimeout(() => setSwipeState("idle"), SWIPE_DURATION);
    }, SWIPE_DURATION);
  }

  function handleBackCard() {
    if (swipeState !== "idle" || !canGoBack) return;
    setSwipeState("back-out");

    setTimeout(() => {
      setHistoryIndex(historyIndex - 1);
      setIsFlipped(false);
      setSwipeState("back-in");

      setTimeout(() => setSwipeState("idle"), SWIPE_DURATION);
    }, SWIPE_DURATION);
  }

  function handleFilterChange(newFilter) {
    if (swipeState !== "idle" || newFilter === filter) return;

    const indices = getFilteredIndices(newFilter);
    const randomIndex = indices[Math.floor(Math.random() * indices.length)];

    setFilter(newFilter);
    setHistory([randomIndex]);
    setHistoryIndex(0);
    setIsFlipped(false);
  }

  function markCard(status) {
    setProgress((prev) => ({ ...prev, [currentCard]: status }));
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNextCard();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleBackCard();
      } else if (event.key === " " || event.key === "Enter") {
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
        Total cards: {cards.length}
        {filter !== "All" && ` · Showing ${filteredIndices.length} ${filter}`}
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
      </div>

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

              <p className="flip-instruction">Click to reveal the paw-some answer</p>
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

      <div className="know-row">
        <button
          className="learning-button"
          onClick={() => markCard("learning")}
          disabled={!isFlipped}
        >
          📚 Still learning
        </button>

        <button
          className="known-button"
          onClick={() => markCard("known")}
          disabled={!isFlipped}
        >
          ✅ Know it
        </button>
      </div>

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
        >
          Next Card 🐾
        </button>
      </div>

      <p className="score-summary">
        ✅ Known: {knownCount} &nbsp;·&nbsp; 📚 Still learning: {learningCount} &nbsp;·&nbsp; Unseen: {cards.length - Object.keys(progress).length}
      </p>
    </div>
  );
}

export default App;