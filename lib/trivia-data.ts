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
    question: "What is Anne's favorite color?",
    type: "multiple-choice",
    options: ["Blue", "Green", "Purple", "Red"],
    correctAnswer: 1, // Green (index 1)
    points: 1,
  },
  {
    id: 2,
    question: "In what year was Anne born?",
    type: "text",
    correctAnswer: "1964", // Accept exact year
    points: 2,
  },
  {
    id: 3,
    question: "What is Anne's favorite hobby?",
    type: "multiple-choice",
    options: ["Reading", "Gardening", "Cooking", "Painting"],
    correctAnswer: 1, // Gardening (example)
    points: 1,
  },
  {
    id: 4,
    question: "What city was Anne born in?",
    type: "text",
    correctAnswer: "Springfield", // Example city
    points: 2,
  },
  {
    id: 5,
    question: "How many children does Anne have?",
    type: "multiple-choice",
    options: ["1", "2", "3", "4"],
    correctAnswer: 2, // 3 children (example)
    points: 1,
  },
  {
    id: 6,
    question: "What is Anne's maiden name?",
    type: "text",
    correctAnswer: "Johnson", // Example maiden name
    points: 3,
  },
  {
    id: 7,
    question: "What is Anne's favorite type of music?",
    type: "multiple-choice",
    options: ["Classical", "Rock", "Country", "Jazz"],
    correctAnswer: 0, // Classical (example)
    points: 1,
  },
  {
    id: 8,
    question: "What was Anne's first job?",
    type: "text",
    correctAnswer: "Teacher", // Example job
    points: 2,
  },
  {
    id: 9,
    question: "What is Anne's favorite season?",
    type: "multiple-choice",
    options: ["Spring", "Summer", "Fall", "Winter"],
    correctAnswer: 2, // Fall (example)
    points: 1,
  },
  {
    id: 10,
    question: "What year did Anne get married?",
    type: "text",
    correctAnswer: "1985", // Example year
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
