"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import CreateTaskModal from "@/components/CreateTaskModal";
import { Trash2, Plus, CheckCircle2, Clock } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Task } from "@/types/task";

const MySwal = withReactContent(Swal);

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Fetch tasks on mount
  useEffect(() => {
    const handleOpenModal = () => setIsModalOpen(true);

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) return router.push("/login");

      await fetchTasks(session.access_token);
    };

    init();

    window.addEventListener("open-create-task-modal", handleOpenModal);
    return () => {
      window.removeEventListener("open-create-task-modal", handleOpenModal);
    };
  }, [router, supabase]);

  // Fetch tasks API
  const fetchTasks = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) return router.push("/login");

      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      MySwal.fire("Error", "Failed to fetch tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete task with SweetAlert2
  const handleDelete = async (id: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return router.push("/login");

    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this task?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/tasks?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        MySwal.fire("Deleted!", "Task deleted successfully.", "success");
      } else throw new Error("Failed to delete task");
    } catch (error) {
      console.error(error);
      MySwal.fire("Error", "Failed to delete task", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle new task from modal
  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
    MySwal.fire("Success", "Task created successfully!", "success");
  };

  // Helper to format date & time
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return (
        d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) +
        " • " +
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } catch {
      return "—";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              My Tasks
            </h1>
            <p className="text-muted-foreground mt-1">Stay organized and productive</p>
          </div>
          {/* <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" /> New Task
          </button> */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-card rounded-2xl animate-pulse border border-border/50"
              />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No tasks yet</h3>
            <p className="text-muted-foreground text-center mb-8 max-w-sm">
              Start by creating your first task and stay on top of your goals
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Create Your First Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => {
              return (
                <div
                  key={task.id}
                  className="group relative h-full bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:via-transparent group-hover:to-accent/5 transition-all duration-300" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <button
                        onClick={() => handleDelete(task.id)}
                        disabled={deletingId === task.id}
                        className="ml-auto p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                        title="Delete task"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-grow">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <CreateTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}
