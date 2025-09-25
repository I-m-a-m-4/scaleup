'use client';

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const initialGoals = [
  {
    title: "Make Mum's Business #1",
    description: "Make her dermatology clinic and skincare shop the number 1 in Nigeria.",
    progress: 25,
    category: "Business"
  },
  {
    title: "Become a Business Mogul",
    description: "My knowledge about business and wealth should have 10x-ed.",
    progress: 40,
    category: "Personal Growth"
  },
  {
    title: "Master AI Prompting",
    description: "Become the master of AI Prompting for business and personal use.",
    progress: 60,
    category: "Learning"
  },
  {
    title: "Health & Wellness",
    description: "Take my health very seriously and pray Tahajjud prayers at least four times weekly.",
    progress: 75,
    category: "Health"
  },
  {
    title: "Build a Cofounder Partnership",
    description: "Do deep research and find a cofounder to partner with to solve problems.",
    progress: 10,
    category: "Networking"
  },
  {
    title: "Launch New Software",
    description: "My Software should have been solving business brand problem.",
    progress: 5,
    category: "Business"
  }
];

const goalSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  category: z.string().nonempty("Please select a category."),
});

type GoalFormValues = z.infer<typeof goalSchema>;

export default function GoalsPage() {
  const [goals, setGoals] = useState(initialGoals);

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
    },
  });

  const onSubmit = (data: GoalFormValues) => {
    setGoals(prev => [...prev, { ...data, progress: 0 }]);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add a New Goal</CardTitle>
          <CardDescription>What new heights do you want to conquer?</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Launch a new product" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what success looks like" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Personal Growth">Personal Growth</SelectItem>
                        <SelectItem value="Learning">Learning</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Networking">Networking</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {goals.map((goal, index) => (
          <Card key={index} className="flex flex-col bg-card hover:border-primary/50 transition-colors duration-300">
            <CardHeader>
              <div className="flex items-start gap-3">
                  <Target className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <CardTitle className="font-headline">{goal.title}</CardTitle>
                    <CardDescription className="mt-1">{goal.description}</CardDescription>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} aria-label={`${goal.progress}% complete`} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <span className="text-sm font-medium text-primary">{goal.category}</span>
              <Button variant="outline" size="sm">Update Progress</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
