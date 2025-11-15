'use client'
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { X, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Task } from '@/types/task';


interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onTaskCreated,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await res.json();
      onTaskCreated(newTask);
      setTitle('');
      setDescription('');
      onClose();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            type: 'success',
            message: 'Task created successfully!',
          },
        }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task';
      setError(message);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            type: 'error',
            message,
          },
        }));
      }
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gradient-to-br from-card via-card to-secondary/10 border border-primary/20 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">
          <div className="relative overflow-hidden">
            {/* Background gradient accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-3xl -mr-8 -mt-8" />
            
            <div className="relative flex items-start justify-between p-6 border-b border-primary/10">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-gradient-to-br from-primary to-accent rounded-xl text-primary-foreground">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Create Task</h2>
                  <p className="text-sm text-muted-foreground mt-1">Add something new to your list</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-foreground mb-2.5">
                Task Title
              </label>
              <div className="relative group">
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  disabled={loading}
                  required
                  className="w-full px-4 py-3 bg-input/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-input transition-all duration-200 disabled:opacity-50 group-hover:border-primary/30"
                />
                {title && !loading && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-in fade-in" />
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-foreground mb-2.5">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about your task..."
                disabled={loading}
                rows={4}
                className="w-full px-4 py-3 bg-input/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-input transition-all duration-200 resize-none disabled:opacity-50 hover:border-primary/30"
              />
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl animate-in slide-in-from-top-2">
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 text-foreground border border-border/50 rounded-xl font-semibold hover:bg-muted hover:border-primary/30 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground rounded-xl font-semibold hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent via-primary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Create Task
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
