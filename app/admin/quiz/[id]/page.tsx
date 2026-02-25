'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Plus, Edit2, Trash2, Save, X, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

const SPORT_EMOJI: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  volleyball: '🏐',
  basketball: '🏀',
  kabaddi: '👥',
  shuttle: '🏸',
  tennis: '🎾',
};

interface Question {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  difficulty: string;
  marks: number;
}

// Mock quiz data - in production, fetch from API
const MOCK_QUIZZES: Record<string, { id: number; title: string; sport: string }> = {
  '1': { id: 1, title: 'Cricket Basics Quiz', sport: 'Cricket' },
  '2': { id: 2, title: 'Football Rules Master', sport: 'Football' },
  '3': { id: 3, title: 'Volleyball Strategy Quiz', sport: 'Volleyball' },
};

const INITIAL_QUESTIONS: Question[] = [
  {
    id: 1,
    questionText: 'How many players are on a cricket team at any given time?',
    optionA: '10',
    optionB: '11',
    optionC: '12',
    optionD: '13',
    correctAnswer: 'B',
    difficulty: 'Easy',
    marks: 5,
  },
  {
    id: 2,
    questionText: 'What is the width of cricket stumps?',
    optionA: '7 inches',
    optionB: '8 inches',
    optionC: '9 inches',
    optionD: '10 inches',
    correctAnswer: 'C',
    difficulty: 'Medium',
    marks: 10,
  },
];

const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];

export default function QuizQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sport = (searchParams.get('sport') || 'cricket').toLowerCase();
  const sportEmoji = SPORT_EMOJI[sport] || '🏆';
  const quizId = params.id as string;
  
  const [quiz, setQuiz] = useState(MOCK_QUIZZES[quizId] || null);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A' as 'A' | 'B' | 'C' | 'D',
    difficulty: 'Easy',
    marks: 5,
  });

  useEffect(() => {
    // In production, fetch quiz and questions from API
    if (!quiz) {
      router.push('/admin/quiz');
    }
  }, [quiz, router]);

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      difficulty: 'Easy',
      marks: 5,
    });
  };

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setFormData({
      questionText: question.questionText,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctAnswer: question.correctAnswer,
      difficulty: question.difficulty,
      marks: question.marks,
    });
  };

  const handleSave = () => {
    // Validate form
    if (!formData.questionText || !formData.optionA || !formData.optionB || !formData.optionC || !formData.optionD) {
      alert('Please fill in all fields');
      return;
    }

    if (editingId !== null) {
      // Edit existing question
      setQuestions(
        questions.map((q) =>
          q.id === editingId
            ? { ...q, ...formData }
            : q
        )
      );
      setEditingId(null);
    } else {
      // Add new question
      const newQuestion: Question = {
        id: Math.max(...questions.map((q) => q.id), 0) + 1,
        ...formData,
      };
      setQuestions([...questions, newQuestion]);
      setIsAdding(false);
    }

    // Show success message
    alert('Question saved successfully!');
    
    // Reset form
    setFormData({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      difficulty: 'Easy',
      marks: 5,
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      difficulty: 'Easy',
      marks: 5,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setQuestions(questions.filter((q) => q.id !== id));
      alert('Question deleted successfully!');
    }
  };

  if (!quiz) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <AdminSidebar sport={sport} sportIcon={sportEmoji} />

      <main className="flex-1 overflow-auto bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border sticky top-0 z-10 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-3xl font-bold">{quiz.title}</h1>
                <p className="text-muted-foreground">Manage quiz questions</p>
              </div>
            </div>
            <Link href={`/admin/quiz?sport=${sport}`}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quizzes
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-card border-blue-500/30">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Questions</p>
                  <p className="text-3xl font-bold text-blue-400">{questions.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-green-500/30">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Marks</p>
                  <p className="text-3xl font-bold text-green-400">
                    {questions.reduce((sum, q) => sum + q.marks, 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-amber-500/30">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Sport</p>
                  <p className="text-xl font-bold text-amber-400">{quiz.sport}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Button */}
          {!isAdding && editingId === null && (
            <div className="mb-6">
              <Button onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Add New Question
              </Button>
            </div>
          )}

          {/* Add/Edit Form */}
          {(isAdding || editingId !== null) && (
            <Card className="mb-6 border-blue-500/50 bg-blue-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-500" />
                  {editingId !== null ? 'Edit Question' : 'Add New Question'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Question Text</label>
                    <Textarea
                      value={formData.questionText}
                      onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                      placeholder="Enter your question here"
                      rows={3}
                      className="bg-background"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Option A</label>
                      <Input
                        value={formData.optionA}
                        onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                        placeholder="First option"
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Option B</label>
                      <Input
                        value={formData.optionB}
                        onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                        placeholder="Second option"
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Option C</label>
                      <Input
                        value={formData.optionC}
                        onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                        placeholder="Third option"
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Option D</label>
                      <Input
                        value={formData.optionD}
                        onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                        placeholder="Fourth option"
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Correct Answer</label>
                      <select
                        value={formData.correctAnswer}
                        onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value as 'A' | 'B' | 'C' | 'D' })}
                        className="w-full px-3 py-2 bg-background border border-input rounded-md"
                      >
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Difficulty</label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-input rounded-md"
                      >
                        {DIFFICULTY_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Marks</label>
                      <Input
                        type="number"
                        value={formData.marks}
                        onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) || 0 })}
                        min="1"
                        max="100"
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600">
                      <Save className="w-4 h-4 mr-2" />
                      Save Question
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Questions List */}
          <div className="space-y-4">
            {questions.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="pt-6 text-center py-12">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">No questions yet</p>
                  <p className="text-muted-foreground mb-4">Add your first question to get started</p>
                  <Button onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>
            ) : (
              questions.map((question, index) => (
                <Card key={question.id} className="bg-card border-border hover:border-blue-500/50 transition">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                            Q{index + 1}
                          </Badge>
                          <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                            {question.difficulty}
                          </Badge>
                          <Badge variant="outline" className="border-green-500/50 text-green-400">
                            {question.marks} marks
                          </Badge>
                        </div>

                        <h3 className="text-lg font-semibold mb-4">{question.questionText}</h3>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div className={`p-3 rounded-lg border ${question.correctAnswer === 'A' ? 'border-green-500/50 bg-green-500/10' : 'border-border bg-card'}`}>
                            <div className="flex items-center gap-2">
                              {question.correctAnswer === 'A' && <CheckCircle className="w-4 h-4 text-green-500" />}
                              <span className="font-medium">A:</span>
                              <span>{question.optionA}</span>
                            </div>
                          </div>
                          <div className={`p-3 rounded-lg border ${question.correctAnswer === 'B' ? 'border-green-500/50 bg-green-500/10' : 'border-border bg-card'}`}>
                            <div className="flex items-center gap-2">
                              {question.correctAnswer === 'B' && <CheckCircle className="w-4 h-4 text-green-500" />}
                              <span className="font-medium">B:</span>
                              <span>{question.optionB}</span>
                            </div>
                          </div>
                          <div className={`p-3 rounded-lg border ${question.correctAnswer === 'C' ? 'border-green-500/50 bg-green-500/10' : 'border-border bg-card'}`}>
                            <div className="flex items-center gap-2">
                              {question.correctAnswer === 'C' && <CheckCircle className="w-4 h-4 text-green-500" />}
                              <span className="font-medium">C:</span>
                              <span>{question.optionC}</span>
                            </div>
                          </div>
                          <div className={`p-3 rounded-lg border ${question.correctAnswer === 'D' ? 'border-green-500/50 bg-green-500/10' : 'border-border bg-card'}`}>
                            <div className="flex items-center gap-2">
                              {question.correctAnswer === 'D' && <CheckCircle className="w-4 h-4 text-green-500" />}
                              <span className="font-medium">D:</span>
                              <span>{question.optionD}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(question)}
                          className="border-blue-500/50 hover:bg-blue-500/10 text-blue-500"
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(question.id)}
                          className="border-red-500/50 hover:bg-red-500/10 text-red-500"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
