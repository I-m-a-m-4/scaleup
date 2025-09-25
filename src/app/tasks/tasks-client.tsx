'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { prioritizeTasks } from '@/ai/flows/prioritize-tasks';
import { gradeTask } from '@/ai/flows/grade-task';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';


import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Wand2, Loader2, Rocket, Share2, Shield, FastForward } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';


const taskSchema = z.object({
  task: z.string().min(3, 'Task must be at least 3 characters long.'),
});

type Task = {
  id: string; // Firestore ID is a string
  task: string;
  completed: boolean;
  priority?: 'High' | 'Medium' | 'Low';
  urgency?: 'Urgent' | 'Not Urgent';
  userId?: string;
};

type MissionPayload = {
  task: string;
  score: number | null;
  isGrading: boolean;
};

export default function TasksClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [missionPayload, setMissionPayload] = useState<MissionPayload | null>(null);
  const { toast } = useToast();
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setIsDataLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsDataLoading(false);
        setTasks([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && db) {
      setIsDataLoading(true);
      const tasksCollection = collection(db, 'tasks');
      const q = query(tasksCollection, where('userId', '==', user.uid));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setTasks(tasksData);
        setIsDataLoading(false);
      }, (error) => {
        console.error("Error fetching tasks: ", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch tasks from the database.',
        });
        setIsDataLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user, toast]);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      task: '',
    },
  });

  async function onSubmit(values: z.infer<typeof taskSchema>) {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not signed in', description: 'You must be signed in to add tasks.' });
      return;
    }
    if (!db) {
        toast({ variant: 'destructive', title: 'Database not configured', description: 'Could not connect to the database.' });
        return;
    }
    try {
      await addDoc(collection(db, 'tasks'), {
        task: values.task,
        completed: false,
        userId: user.uid,
        createdAt: new Date(),
      });
      form.reset();
    } catch (error) {
      console.error('Error adding task: ', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add task.' });
    }
  }

  const handlePrioritize = async () => {
    setIsPrioritizing(true);
    try {
      const tasksToPrioritize = tasks.filter(t => !t.completed).map((t) => ({ task: t.task }));
      if (tasksToPrioritize.length === 0) {
        toast({
          title: 'No tasks to prioritize',
          description: 'Add or uncheck some tasks before using AI prioritization.',
        });
        setIsPrioritizing(false);
        return;
      }
      const prioritizedResult = await prioritizeTasks(tasksToPrioritize);

      if (!db) {
        toast({ variant: 'destructive', title: 'Database not configured', description: 'Could not save priorities.' });
        setIsPrioritizing(false);
        return;
      }

      const updatePromises = tasks.map((task) => {
        const prioritized = prioritizedResult.find((p) => p.task === task.task);
        if (prioritized) {
          const taskRef = doc(db, 'tasks', task.id);
          return updateDoc(taskRef, {
            priority: prioritized.priority,
            urgency: prioritized.urgency,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);

      toast({
        title: 'Success!',
        description: 'Your tasks have been prioritized by AI.',
      });
    } catch (error) {
      console.error('Failed to prioritize tasks:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to prioritize tasks. Please try again.',
      });
    } finally {
      setIsPrioritizing(false);
    }
  };

  const handleTaskCompletion = async (taskId: string, completed: boolean) => {
    if (!db) {
      toast({ variant: 'destructive', title: 'Database not configured', description: 'Could not update task.' });
      return;
    }
    const completedTask = tasks.find(task => task.id === taskId);
    const taskRef = doc(db, 'tasks', taskId);
    try {
      await updateDoc(taskRef, { completed });
      if (completed && completedTask) {
        setMissionPayload({ task: completedTask.task, score: null, isGrading: true });
        
        try {
          const result = await gradeTask({ task: completedTask.task });
          setMissionPayload({ task: completedTask.task, score: result.score, isGrading: false });
        } catch (error) {
            console.error('Error grading task:', error);
            toast({
                variant: 'destructive',
                title: 'AI Grading Failed',
                description: 'Could not calculate payload score.'
            })
            setMissionPayload({ task: completedTask.task, score: null, isGrading: false });
        }
      }
    } catch (error) {
      console.error('Error updating task: ', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update task.' });
    }
  };

  const getPriorityBadgeVariant = (priority?: string) => {
    switch (priority) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  const getUrgencyBadgeVariant = (urgency?: string): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
    switch (urgency) {
      case 'Urgent':
        return 'default';
      case 'Not Urgent':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!isFirebaseConfigured) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-destructive" />
                    <div>
                        <CardTitle>Feature Unavailable</CardTitle>
                        <CardDescription>This feature requires a Firebase connection.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Please configure your Firebase credentials in the <strong>.env</strong> file to use the Tasks feature.
                </p>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="space-y-6">
      {missionPayload && missionPayload.score && <Confetti width={width} height={height} recycle={false} numberOfPieces={missionPayload.score * 5} onConfettiComplete={() => setMissionPayload(null)} />}
      
      <Dialog open={!!missionPayload} onOpenChange={(open) => !open && setMissionPayload(null)}>
        <DialogContent className="sm:max-w-md bg-background border-primary">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center text-primary font-bold">Mission Control</DialogTitle>
            <DialogDescription className="text-center">Task complete. Analyzing payload...</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4 border-2 border-dashed border-primary/50 rounded-lg m-4">
             <Rocket className="h-16 w-16 text-primary animate-pulse" />
             <p className="text-sm text-muted-foreground text-center">Payload from task:</p>
             <p className="font-medium text-center text-lg">"{missionPayload?.task}"</p>

             <p className="text-lg font-semibold text-center text-foreground pt-4">AI Payload Score:</p>
              {missionPayload?.isGrading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <Badge variant="default" className="text-2xl py-2 px-6">{missionPayload?.score || 'N/A'}</Badge>
              )}
          </div>
          <div className="flex justify-center">
             <Button disabled={missionPayload?.isGrading}>
                {missionPayload?.isGrading ? 'Calculating...' : <><Rocket className="mr-2 h-4 w-4" />Launch Mission</>}
             </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
          <CardDescription>Add a new task to your list. It will be saved automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
              <FormField
                control={form.control}
                name="task"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Task Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Learn more about my deen" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={!user}>Add Task</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Your Tasks</CardTitle>
                <CardDescription>Here is your current list of tasks. <span className="text-primary/80 font-medium flex items-center gap-1"><FastForward className="inline h-4 w-4" />Speed is a priority.</span></CardDescription>
            </div>
            <Button onClick={handlePrioritize} disabled={isPrioritizing || !user}>
                {isPrioritizing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                )}
                Prioritize with AI
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Done</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Urgency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isDataLoading ? (
                 Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  </TableRow>
                 ))
              ) : !user ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    Please sign in to manage your tasks.
                  </TableCell>
                </TableRow>
              ) : tasks.length > 0 ? tasks.map((task) => (
                <TableRow key={task.id} data-state={task.completed ? 'completed' : 'pending'}>
                  <TableCell>
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={(checked) => handleTaskCompletion(task.id, !!checked)}
                      aria-label={`Mark ${task.task} as ${task.completed ? 'not done' : 'done'}`}
                    />
                  </TableCell>
                  <TableCell className={`font-medium ${task.completed ? 'text-muted-foreground line-through' : ''}`}>{task.task}</TableCell>
                  <TableCell>
                    {task.priority ? (
                      <Badge variant={getPriorityBadgeVariant(task.priority)}>
                        {task.priority}
                      </Badge>
                    ) : (
                      isPrioritizing && !task.completed && <Skeleton className="h-6 w-20" />
                    )}
                  </TableCell>
                  <TableCell>
                    {task.urgency ? (
                      <Badge variant={getUrgencyBadgeVariant(task.urgency)}>
                        {task.urgency}
                      </Badge>
                    ) : (
                      isPrioritizing && !task.completed && <Skeleton className="h-6 w-24" />
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No tasks yet. Add one above!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
