'use client';
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Swords, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const leaderboardData = [
  { rank: 1, name: "Alpha Achiever", points: 12500, avatar: "https://placehold.co/40x40.png", hint: "person smiling" },
  { rank: 2, name: "ScaleUp User", points: 5600, avatar: "https://placehold.co/40x40.png", hint: "profile avatar", isCurrentUser: true },
  { rank: 3, name: "Beta Builder", points: 4800, avatar: "https://placehold.co/40x40.png", hint: "person thinking" },
  { rank: 4, name: "Gamma Go-Getter", points: 3200, avatar: "https://placehold.co/40x40.png", hint: "person reading" },
  { rank: 5, name: "Delta Dynamo", points: 2100, avatar: "https://placehold.co/40x40.png", hint: "person coding" },
];

export default function CompetitionsPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLeaderboard(leaderboardData);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>See where you stand among your competitors.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4 p-2">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 flex-grow" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))
              ) : (
                leaderboard.map(user => (
                  <div key={user.rank} className={`flex items-center gap-4 p-2 rounded-lg ${user.isCurrentUser ? 'bg-primary/10' : ''}`}>
                    <span className="font-bold text-lg w-6 text-center">{user.rank}</span>
                    <Avatar>
                      <AvatarImage src={user.avatar} data-ai-hint={user.hint} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="font-medium flex-grow">{user.name}</p>
                    <Badge variant={user.isCurrentUser ? "default" : "secondary"}>{user.points} pts</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Swords className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Start a Competition</CardTitle>
                <CardDescription>Challenge another user to a friendly competition.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input placeholder="Search for a user..." />
              <Button size="icon"><Search className="h-4 w-4" /></Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Challenge</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
