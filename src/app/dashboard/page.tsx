import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Rocket, Trophy, ListChecks, Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in-0 duration-500">
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Welcome back!</CardTitle>
          <CardDescription className="text-muted-foreground/80">Here's your progress overview. Keep up the momentum!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Level</span>
              <span className="text-sm font-bold text-primary">Level 5: Go-Getter</span>
            </div>
            <Progress value={60} aria-label="60% progress to next level" />
            <p className="text-sm text-muted-foreground">You are 400 points away from Level 6: Mastermind!</p>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Quick Add Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex gap-2">
            <Input placeholder="e.g., Learn about the art of connecting with people" className="flex-grow bg-background/50" />
            <Button type="submit" size="icon" aria-label="Add Task"><Plus className="h-4 w-4" /></Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
          <Rocket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">
            +10% from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
          <ListChecks className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">
            2 tasks overdue
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">5600</div>
          <p className="text-xs text-muted-foreground">
            Top 10% on leaderboard
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
