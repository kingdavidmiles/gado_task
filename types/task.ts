export type Task = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  due_date?: string;
  status?: string;
  priority?: string;
};
