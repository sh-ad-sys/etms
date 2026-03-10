import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  deadline: string;
  assignedBy: string;
  completed: boolean;
  hasComment: boolean;
}

interface TaskListCardProps {
  tasks: Task[];
}

export function TaskListCard({ tasks: initialTasks }: TaskListCardProps) {
  const [tasks, setTasks] = useState(initialTasks);

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Today&apos;s Tasks</CardTitle>
          <Badge variant="secondary">
            {completedCount} / {totalCount} Completed
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={`p-4 rounded-lg border-2 transition-all ${
                task.completed 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-white border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleToggleTask(task.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </h4>
                    <Badge className={getPriorityColor(task.priority)} variant="secondary">
                      {task.priority}
                    </Badge>
                  </div>
                  <p className={`text-sm mb-3 ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                    {task.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.deadline}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Avatar className="w-4 h-4">
                          <AvatarFallback className="text-[8px]">
                            {task.assignedBy.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{task.assignedBy}</span>
                      </div>
                    </div>
                    {task.hasComment && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        View Feedback
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
