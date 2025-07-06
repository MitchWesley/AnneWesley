export interface TriviaQuestion {
  id: number
  question: string
  type: "multiple-choice" | "text"
  options?: string[] // Only for multiple choice
  correctAnswer: string | number // For multiple choice: index (0,1,2,3), for text: exact answer
  points: number
}

export const triviaQuestions: TriviaQuestion[] = [
  {
    id: 1,
    question: "What is Anne's favorite color? (Don't use any upper case)",
    type: "text",
    correctAnswer: "green",
    points: 3,
  },
  {
    id: 2,
    question: "Who is Anne's favorite musician/music group?",
    type: "multiple-choice",
    options: ["Taylor Swift", "Rascal Flatts", "The Beatles", "Carrie Underwood"],
    correctAnswer: 1, // Rascal Flatts
    points: 2,
  },
  {
    id: 3,
    question: "What animal accompanied Anne to classes in college?",
    type: "multiple-choice",
    options: ["A cat", "A duck", "A hamster", "A bird"],
    correctAnswer: 1, // A duck
    points: 2,
  },
  {
    id: 4,
    question: "How many siblings does Anne have?",
    type: "text",
    correctAnswer: "6",
    points: 2,
  },
  {
    id: 5,
    question: "What business did Anne make up when playing pretend as a kid?",
    type: "multiple-choice",
    options: ["A restaurant", "A trucking company", "A flower shop", "A bakery"],
    correctAnswer: 1, // A trucking company
    points: 3,
  },
  {
    id: 6,
    question: "What would Anne do on a sunny afternoon?",
    type: "multiple-choice",
    options: ["Read a book", "Get ice cream", "Go for a walk", "Take a nap"],
    correctAnswer: 1, // Get ice cream
    points: 2,
  },
  {
    id: 7,
    question: "What is Anne's favorite sweet treat?",
    type: "multiple-choice",
    options: ["Milk chocolate", "Dark chocolate", "White chocolate", "Candy bars"],
    correctAnswer: 1, // Dark chocolate
    points: 2,
  },
  {
    id: 8,
    question: "What does Anne NOT like in her salad?",
    type: "multiple-choice",
    options: ["Tomatoes", "Pepper", "Onions", "Croutons"],
    correctAnswer: 1, // Pepper
    points: 2,
  },
  {
    id: 9,
    question: "Where does Anne work?",
    type: "multiple-choice",
    options: ["The Smith Center", "The Watson Institute", "The Johnson Foundation", "The Miller Group"],
    correctAnswer: 1, // The Watson Institute
    points: 1,
  },
  {
    id: 10,
    question: "What nickname did Anne have for her two sons when they were little?",
    type: "multiple-choice",
    options: ["Little One and Big One", "Baby A and Baby B", "Sweetie and Honey", "Buddy and Pal"],
    correctAnswer: 1, // Baby A and Baby B
    points: 2,
  },
  {
    id: 11,
    question: "What is Anne's least favorite form of transportation?",
    type: "multiple-choice",
    options: ["Cars", "Planes", "Trains", "Boats"],
    correctAnswer: 1, // Planes
    points: 2,
  },
]

export function checkAnswers(userAnswers: Record<number, string | number>): {
  score: number
  totalQuestions: number
  results: Array<{
    questionId: number
    correct: boolean
    userAnswer: string | number
    correctAnswer: string | number
  }>
} {
  let score = 0
  const results = []

  for (const question of triviaQuestions) {
    const userAnswer = userAnswers[question.id]
    let isCorrect = false

    if (question.type === "multiple-choice") {
      isCorrect = userAnswer === question.correctAnswer
    } else if (question.type === "text") {
      // For text answers, do case-insensitive comparison and trim whitespace
      const userText = String(userAnswer || "")
        .toLowerCase()
        .trim()
      const correctText = String(question.correctAnswer).toLowerCase().trim()
      isCorrect = userText === correctText
    }

    if (isCorrect) {
      score += question.points
    }

    results.push({
      questionId: question.id,
      correct: isCorrect,
      userAnswer: userAnswer || "",
      correctAnswer: question.correctAnswer,
    })
  }

  return {
    score,
    totalQuestions: triviaQuestions.length,
    results,
  }
}
