'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminSidebar } from '@/components/admin-sidebar';
import { getAdminSport, setAdminSport } from '@/lib/admin-sport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Plus, Edit2, Trash2, Save, X, List } from 'lucide-react';
import Link from 'next/link';

const SPORT_EMOJI: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  volleyball: '🏐',
  basketball: '🏀',
  kabaddi: '👥',
  shuttle: '🏸',
  tennis: '🎾',
};

interface Quiz {
  id: number;
  title: string;
  sport: string;
  difficulty: string;
  questions: number;
  description: string;
  icon: string;
}

const INITIAL_QUIZZES: Quiz[] = [
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
];

const SPORT_OPTIONS = [
  { value: 'Cricket', label: 'Cricket 🏏' },
  { value: 'Football', label: 'Football ⚽' },
  { value: 'Volleyball', label: 'Volleyball 🏐' },
  { value: 'Basketball', label: 'Basketball 🏀' },
  { value: 'Kabaddi', label: 'Kabaddi 👥' },
  { value: 'Shuttle', label: 'Badminton 🏸' },
  { value: 'Tennis', label: 'Tennis 🎾' },
];

const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];

export default function AdminQuizPage() {
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get('sport')?.toLowerCase();
  const fromStorage = getAdminSport()?.toLowerCase();
  const sport = (fromUrl || fromStorage || 'cricket').toLowerCase();

  useEffect(() => {
    if (fromUrl) setAdminSport(fromUrl);
  }, [fromUrl]);

  const sportEmoji = SPORT_EMOJI[sport] || '🏆';
  
  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    sport: 'Cricket',
    difficulty: 'Beginner',
    questions: 5,
    description: '',
    icon: '🏏',
  });

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      title: '',
      sport: 'Cricket',
      difficulty: 'Beginner',
      questions: 5,
      description: '',
      icon: '🏏',
    });
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingId(quiz.id);
    setFormData({
      title: quiz.title,
      sport: quiz.sport,
      difficulty: quiz.difficulty,
      questions: quiz.questions,
      description: quiz.description,
      icon: quiz.icon,
    });
  };

  const handleSave = () => {
    if (editingId !== null) {
      // Edit existing quiz
      setQuizzes(
        quizzes.map((q) =>
          q.id === editingId
            ? { ...q, ...formData }
            : q
        )
      );
      setEditingId(null);
    } else {
      // Add new quiz
      const newQuiz: Quiz = {
        id: Math.max(...quizzes.map((q) => q.id), 0) + 1,
        ...formData,
      };
      setQuizzes([...quizzes, newQuiz]);
      setIsAdding(false);
    }
    // Reset form
    setFormData({
      title: '',
      sport: 'Cricket',
      difficulty: 'Beginner',
      questions: 5,
      description: '',
      icon: '🏏',
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      title: '',
      sport: 'Cricket',
      difficulty: 'Beginner',
      questions: 5,
      description: '',
      icon: '🏏',
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      setQuizzes(quizzes.filter((q) => q.id !== id));
    }
  };

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
                <h1 className="text-3xl font-bold">Quiz Management</h1>
                <p className="text-muted-foreground">Create and manage sports quizzes</p>
              </div>
            </div>
            <Link href={`/admin/dashboard?sport=${sport}`}>
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Add Button */}
          {!isAdding && editingId === null && (
            <div className="mb-6">
              <Button onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Add New Quiz
              </Button>
            </div>
          )}

          {/* Add/Edit Form */}
          {(isAdding || editingId !== null) && (
            <Card className="mb-6 border-blue-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-500" />
                  {editingId !== null ? 'Edit Quiz' : 'Add New Quiz'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quiz Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter quiz title"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Sport</label>
                      <select
                        value={formData.sport}
                        onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-input rounded-md"
                      >
                        {SPORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Questions</label>
                    <Input
                      type="number"
                      value={formData.questions}
                      onChange={(e) => setFormData({ ...formData, questions: parseInt(e.target.value) || 0 })}
                      min="1"
                      max="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter quiz description"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600">
                      <Save className="w-4 h-4 mr-2" />
                      Save Quiz
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

          {/* Quiz List */}
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="bg-card border-border hover:border-blue-500/50 transition">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-4xl">{quiz.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
                        <p className="text-muted-foreground mb-3">{quiz.description}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                            {quiz.sport}
                          </Badge>
                          <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                            {quiz.difficulty}
                          </Badge>
                          <Badge variant="outline" className="border-green-500/50 text-green-400">
                            {quiz.questions} Questions
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/admin/quiz/${quiz.id}`}>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <List className="w-4 h-4 mr-1" />
                          Manage Questions
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(quiz)}
                        className="border-blue-500/50 hover:bg-blue-500/10 text-blue-500"
                      >
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(quiz.id)}
                        className="border-red-500/50 hover:bg-red-500/10 text-red-500"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
