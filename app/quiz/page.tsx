'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle, XCircle } from 'lucide-react';

const QUIZZES = [
  {
    id: 1,
    title: 'Cricket Basics Quiz',
    sport: 'Cricket',
    difficulty: 'Beginner',
    questions: 5,
    description: 'Test your knowledge of cricket rules and terminology.',
    icon: '🏏',
  },
  {
    id: 2,
    title: 'Football Rules Master',
    sport: 'Football',
    difficulty: 'Intermediate',
    questions: 8,
    description: 'Challenge yourself with advanced football knowledge.',
    icon: '⚽',
  },
  {
    id: 3,
    title: 'Volleyball Strategy Quiz',
    sport: 'Volleyball',
    difficulty: 'Advanced',
    questions: 10,
    description: 'Deep dive into volleyball tactics and strategies.',
    icon: '🏐',
  },
  {
    id: 4,
    title: 'Basketball Player Stats',
    sport: 'Basketball',
    difficulty: 'Beginner',
    questions: 6,
    description: 'Identify famous basketball players and their achievements.',
    icon: '🏀',
  },
  {
    id: 5,
    title: 'Kabaddi Legends Quiz',
    sport: 'Kabaddi',
    difficulty: 'Intermediate',
    questions: 7,
    description: 'Learn about kabaddi legends and historical moments.',
    icon: '👥',
  },
  {
    id: 6,
    title: 'Badminton Techniques',
    sport: 'Shuttle',
    difficulty: 'Advanced',
    questions: 9,
    description: 'Master badminton techniques and shot types.',
    icon: '🏸',
  },
];

const QUIZ_QUESTIONS = {
  1: [
    {
      id: 1,
      question: 'How many players are on a cricket team at any given time?',
      options: ['10', '11', '12', '13'],
      correct: 1,
    },
    {
      id: 2,
      question: 'What is the width of cricket stumps?',
      options: ['7 inches', '8 inches', '9 inches', '10 inches'],
      correct: 2,
    },
    {
      id: 3,
      question: 'How many balls are in an over?',
      options: ['5', '6', '7', '8'],
      correct: 1,
    },
    {
      id: 4,
      question: 'What is the maximum length of a cricket pitch?',
      options: ['20 yards', '22 yards', '25 yards', '30 yards'],
      correct: 1,
    },
    {
      id: 5,
      question: 'What does LBW stand for?',
      options: ['Leg Before Wicket', 'Left Boundary Win', 'Leg Break Wicket', 'Low Ball Wicket'],
      correct: 0,
    },
  ],
};

function QuizCard({ quiz }: { quiz: (typeof QUIZZES)[0] }) {
  const [isAnswering, setIsAnswering] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleStartQuiz = () => {
    setIsAnswering(true);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
  };

  const handleAnswer = () => {
    if (currentQuestion < (QUIZ_QUESTIONS[quiz.id as keyof typeof QUIZ_QUESTIONS]?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleResetQuiz = () => {
    setIsAnswering(false);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
  };

  const difficultyColors = {
    Beginner: 'bg-green-500/20 text-green-400',
    Intermediate: 'bg-yellow-500/20 text-yellow-400',
    Advanced: 'bg-red-500/20 text-red-400',
  };

  return (
    <Card className="bg-card border-border hover:border-blue-500/50 transition">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-4xl mb-3">{quiz.icon}</div>
            <CardTitle className="text-2xl mb-2">{quiz.title}</CardTitle>
            <CardDescription>{quiz.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <Badge className={difficultyColors[quiz.difficulty as keyof typeof difficultyColors]}>
            {quiz.difficulty}
          </Badge>
          <span className="text-sm text-muted-foreground">{quiz.questions} Questions</span>
        </div>

        {!isAnswering ? (
          <Button onClick={handleStartQuiz} className="w-full gap-2 bg-blue-500 hover:bg-blue-600">
            <Brain className="w-4 h-4" />
            Start Quiz
          </Button>
        ) : showResults ? (
          <div className="space-y-3">
            <div className="text-center py-4 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Your Score</p>
              <p className="text-3xl font-bold text-blue-500">{score}/5</p>
            </div>
            <Button onClick={handleResetQuiz} className="w-full gap-2">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-background p-4 rounded-lg">
              <p className="font-semibold mb-2">Question {currentQuestion + 1}/5</p>
              <p className="text-sm text-muted-foreground">
                {QUIZ_QUESTIONS[quiz.id as keyof typeof QUIZ_QUESTIONS]?.[currentQuestion]?.question}
              </p>
            </div>
            <Button onClick={handleAnswer} className="w-full gap-2 bg-blue-500 hover:bg-blue-600">
              <CheckCircle className="w-4 h-4" />
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function QuizPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 ml-64 overflow-auto bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border sticky top-0 z-10 px-8 py-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold">Sports Quiz</h1>
              <p className="text-muted-foreground">Test your knowledge across all sports</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {QUIZZES.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
