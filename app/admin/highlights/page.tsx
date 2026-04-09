'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminSidebar } from '@/components/admin-sidebar';
import { getAdminSport, setAdminSport } from '@/lib/admin-sport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Flame, Plus, Edit2, Trash2, Save, X, Play, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

const SPORT_EMOJI: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  volleyball: '🏐',
  basketball: '🏀',
  kabaddi: '👥',
  shuttle: '🏸',
  tennis: '🎾',
};

/** Backend highlight document */
interface HighlightDoc {
  _id: string;
  title: string;
  sport: string; // ObjectId
  date?: string;
  views?: number;
  duration?: string;
  thumbnailUrl?: string;
  description?: string;
  videoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

type SportDoc = { _id: string; slug: string; name: string };

/** Local form / list item (id for edit/delete) */
interface Highlight {
  id: string;
  title: string;
  sport: string;
  date: string;
  views: number;
  duration: string;
  thumbnail: string;
  description: string;
  videoUrl?: string;
  videoFile?: File | null;
  videoFileName?: string;
}

function docToHighlight(d: HighlightDoc): Highlight {
  return {
    id: d._id,
    title: d.title,
    sport: d.sport, // keep id; UI will show based on selected sport
    date: d.date || new Date().toISOString().split('T')[0],
    views: d.views ?? 0,
    duration: d.duration || '0:00',
    thumbnail: d.thumbnailUrl || '🏆',
    description: d.description || '',
    videoUrl: d.videoUrl,
  };
}

const SPORT_OPTIONS = [
  { value: 'Cricket', label: 'Cricket 🏏' },
  { value: 'Football', label: 'Football ⚽' },
  { value: 'Volleyball', label: 'Volleyball 🏐' },
  { value: 'Basketball', label: 'Basketball 🏀' },
  { value: 'Kabaddi', label: 'Kabaddi 👥' },
  { value: 'Shuttle', label: 'Badminton 🏸' },
  { value: 'Tennis', label: 'Tennis 🎾' },
];

const SPORT_COLORS: Record<string, string> = {
  Cricket: 'bg-green-500/20 text-green-400',
  Football: 'bg-blue-500/20 text-blue-400',
  Volleyball: 'bg-orange-500/20 text-orange-400',
  Basketball: 'bg-amber-500/20 text-amber-400',
  Kabaddi: 'bg-red-500/20 text-red-400',
  Shuttle: 'bg-teal-500/20 text-teal-400',
  Tennis: 'bg-lime-500/20 text-lime-400',
};

export default function AdminHighlightsPage() {
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get('sport')?.toLowerCase();
  const fromStorage = getAdminSport()?.toLowerCase();
  const sport = (fromUrl || fromStorage || 'cricket').toLowerCase();

  useEffect(() => {
    if (fromUrl) setAdminSport(fromUrl);
  }, [fromUrl]);

  const sportEmoji = SPORT_EMOJI[sport] || '🏆';
  const sportSlug = useMemo(() => sport.toLowerCase(), [sport]);

  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [sportId, setSportId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [videoInputType, setVideoInputType] = useState<'file' | 'url'>('url');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    sport: 'Cricket',
    date: new Date().toISOString().split('T')[0],
    views: 0,
    duration: '0:00',
    thumbnail: '🏏',
    description: '',
    videoUrl: '',
    videoFile: null as File | null,
    videoFileName: '',
  });

  const fetchHighlights = useCallback(async () => {
    setLoading(true);
    try {
      const sportsRes = await api.get<{ success: boolean; data: SportDoc[] }>('/api/sports');
      const sports = (sportsRes as { data?: SportDoc[] }).data || [];
      const s = sports.find((x) => x.slug === sportSlug);
      if (!s?._id) {
        setSportId(null);
        setHighlights([]);
        return;
      }
      setSportId(s._id);

      const res = await api.get<{ success: boolean; data: HighlightDoc[] }>(
        `/api/highlights?sportId=${encodeURIComponent(s._id)}`
      );
      const list = (res as { data?: HighlightDoc[] }).data ?? [];
      setHighlights(list.map(docToHighlight));
    } catch {
      setSportId(null);
      setHighlights([]);
    } finally {
      setLoading(false);
    }
  }, [sportSlug]);

  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  const handleAdd = () => {
    setIsAdding(true);
    setVideoInputType('url');
    setUploadProgress(0);
    setSaveError(null);
    setFormData({
      title: '',
      sport: 'Cricket',
      date: new Date().toISOString().split('T')[0],
      views: 0,
      duration: '0:00',
      thumbnail: '🏏',
      description: '',
      videoUrl: '',
      videoFile: null,
      videoFileName: '',
    });
  };

  const handleEdit = (highlight: Highlight) => {
    setEditingId(highlight.id);
    setVideoInputType(highlight.videoUrl ? 'url' : 'file');
    setUploadProgress(0);
    setFormData({
      title: highlight.title,
      sport: highlight.sport,
      date: highlight.date,
      views: highlight.views,
      duration: highlight.duration,
      thumbnail: highlight.thumbnail,
      description: highlight.description,
      videoUrl: highlight.videoUrl || '',
      videoFile: null,
      videoFileName: highlight.videoFileName || '',
    });
    setSaveError(null);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid video file (MP4, MOV, or WebM)');
        return;
      }
      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size must be less than 100MB');
        return;
      }
      
      setFormData({
        ...formData,
        videoFile: file,
        videoFileName: file.name,
        videoUrl: '', // Clear URL if file is selected
      });
      
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setSaveError('Title is required');
      return;
    }
    if (!sportId) {
      setSaveError('Sport is not ready yet');
      return;
    }
    const hasVideo = videoInputType === 'file' ? formData.videoFile : formData.videoUrl?.trim();
    if (!hasVideo && !editingId) {
      setSaveError('Please add a video URL or upload a file');
      return;
    }
    setSaveError(null);
    setUploadProgress(0);
    try {
      if (editingId !== null) {
        await api.patch(`/api/highlights/${editingId}`, {
          title: formData.title.trim(),
          sportId,
          description: formData.description.trim() || undefined,
          duration: formData.duration.trim() || undefined,
          date: formData.date || undefined,
          videoUrl: formData.videoUrl?.trim() || undefined,
        });
        await fetchHighlights();
        setEditingId(null);
      } else {
        const fd = new FormData();
        fd.append('title', formData.title.trim());
        fd.append('sportId', sportId);
        if (formData.description.trim()) fd.append('description', formData.description.trim());
        if (formData.duration.trim()) fd.append('duration', formData.duration.trim());
        if (formData.date) fd.append('date', formData.date);
        if (formData.videoFile) {
          fd.append('video', formData.videoFile);
        } else if (formData.videoUrl?.trim()) {
          fd.append('videoUrl', formData.videoUrl.trim());
        }
        await api.postFormData<{ success: boolean; data: HighlightDoc }>('/api/highlights', fd);
        await fetchHighlights();
        setIsAdding(false);
      }
      setFormData({
        title: '',
        sport: 'Cricket',
        date: new Date().toISOString().split('T')[0],
        views: 0,
        duration: '0:00',
        thumbnail: '🏏',
        description: '',
        videoUrl: '',
        videoFile: null,
        videoFileName: '',
      });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save highlight');
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setUploadProgress(0);
    setSaveError(null);
    setFormData({
      title: '',
      sport: 'Cricket',
      date: new Date().toISOString().split('T')[0],
      views: 0,
      duration: '0:00',
      thumbnail: '🏏',
      description: '',
      videoUrl: '',
      videoFile: null,
      videoFileName: '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this highlight?')) return;
    try {
      await api.delete(`/api/highlights/${id}`);
      await fetchHighlights();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to delete highlight');
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
              <Flame className="w-8 h-8 text-orange-500" />
              <div>
                <h1 className="text-3xl font-bold">Highlights Management</h1>
                <p className="text-muted-foreground">Create and manage sports highlights</p>
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
              <Button onClick={handleAdd} className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Add New Highlight
              </Button>
            </div>
          )}

          {/* Add/Edit Form */}
          {(isAdding || editingId !== null) && (
            <Card className="mb-6 border-orange-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  {editingId !== null ? 'Edit Highlight' : 'Add New Highlight'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Highlight Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter highlight title"
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
                      <label className="block text-sm font-medium mb-2">Date</label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration (mm:ss)</label>
                      <Input
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="e.g., 8:45"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Views</label>
                      <Input
                        type="number"
                        value={formData.views}
                        onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter highlight description"
                      rows={3}
                    />
                  </div>

                  {/* Video Input Section */}
                  <div className="border border-orange-500/30 rounded-lg p-4 bg-orange-500/5">
                    <label className="block text-sm font-medium mb-3 text-orange-400">Video Source</label>
                    
                    {/* Toggle between File Upload and URL */}
                    <div className="flex gap-2 mb-4">
                      <Button
                        type="button"
                        size="sm"
                        variant={videoInputType === 'url' ? 'default' : 'outline'}
                        onClick={() => {
                          setVideoInputType('url');
                          setFormData({ ...formData, videoFile: null, videoFileName: '' });
                        }}
                        className={videoInputType === 'url' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                      >
                        Video URL
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={videoInputType === 'file' ? 'default' : 'outline'}
                        onClick={() => {
                          setVideoInputType('file');
                          setFormData({ ...formData, videoUrl: '' });
                        }}
                        className={videoInputType === 'file' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                      >
                        Upload File
                      </Button>
                    </div>

                    {/* Video URL Input */}
                    {videoInputType === 'url' && (
                      <div>
                        <Input
                          value={formData.videoUrl}
                          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=... or direct video URL"
                          className="bg-background"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Supports YouTube, Vimeo, or direct video links
                        </p>
                      </div>
                    )}

                    {/* Video File Upload */}
                    {videoInputType === 'file' && (
                      <div>
                        <div className="flex items-center gap-3">
                          <label className="flex-1 cursor-pointer">
                            <div className="border-2 border-dashed border-input hover:border-orange-500/50 rounded-lg p-4 text-center transition">
                              <Play className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                              <p className="text-sm font-medium mb-1">
                                {formData.videoFileName || 'Click to upload video'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                MP4, MOV, WebM (Max 100MB)
                              </p>
                            </div>
                            <input
                              type="file"
                              accept="video/mp4,video/quicktime,video/webm"
                              onChange={handleVideoFileChange}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Upload Progress */}
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>Uploading...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-background rounded-full h-2">
                              <div
                                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Upload Success */}
                        {uploadProgress === 100 && formData.videoFileName && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-green-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            Video ready: {formData.videoFileName}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {saveError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <p className="text-sm text-red-500">{saveError}</p>
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600" disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Highlight
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

          {/* Highlights List */}
          <div className="grid gap-4">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                Loading highlights...
              </div>
            ) : highlights.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No highlights yet. Add one above.</p>
            ) : null}
            {!loading && highlights.map((highlight) => (
              <Card key={highlight.id} className="bg-card border-border hover:border-orange-500/50 transition">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-4xl">{highlight.thumbnail}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{highlight.title}</h3>
                        <p className="text-muted-foreground mb-3">{highlight.description}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className={SPORT_COLORS[highlight.sport]}>
                            {highlight.sport}
                          </Badge>
                          <Badge variant="outline" className="border-gray-500/50 text-gray-400">
                            {highlight.duration}
                          </Badge>
                          <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                            {highlight.views.toLocaleString()} views
                          </Badge>
                          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                            {new Date(highlight.date).toLocaleDateString()}
                          </Badge>
                          {highlight.videoUrl && (
                            <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                              <Play className="w-3 h-3 mr-1" />
                              Video URL
                            </Badge>
                          )}
                          {highlight.videoFileName && (
                            <Badge variant="outline" className="border-green-500/50 text-green-400">
                              <Play className="w-3 h-3 mr-1" />
                              {highlight.videoFileName}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(highlight)}
                        className="border-blue-500/50 hover:bg-blue-500/10 text-blue-500"
                      >
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(highlight.id)}
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
