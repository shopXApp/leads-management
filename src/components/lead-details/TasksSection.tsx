import { useState } from 'react';
import { Plus, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddTaskDialog } from '@/components/lead-details/AddTaskDialog';

interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  contactPerson?: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

interface TasksSectionProps {
  leadId: string;
}

export const TasksSection = ({ leadId }: TasksSectionProps) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Follow up on initial contact',
      description: 'Call to discuss event requirements',
      assignedTo: 'John Doe',
      contactPerson: 'Jeff Robertson',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
    }
  ]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setShowAddDialog(false);
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Tasks ({tasks.length})
        </CardTitle>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <AddTaskDialog onAdd={handleAddTask} onCancel={() => setShowAddDialog(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks yet</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-start space-x-3 p-3 border rounded-lg">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => toggleTaskComplete(task.id)}
              >
                <CheckCircle2 
                  className={`h-4 w-4 ${task.completed ? 'text-green-600' : 'text-muted-foreground'}`}
                />
              </Button>
              <div className="flex-1 space-y-1">
                <div className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </div>
                {task.description && (
                  <div className="text-xs text-muted-foreground">{task.description}</div>
                )}
                <div className="flex items-center space-x-2 text-xs">
                  <Badge variant="outline" className="text-xs">
                    {task.assignedTo}
                  </Badge>
                  <span className="text-muted-foreground">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};