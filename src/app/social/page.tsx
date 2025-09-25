'use client';
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, Rss } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const communityMembersData = [
  { name: "Alpha Achiever", bio: "Crushing goals & taking names.", avatar: "https://placehold.co/48x48.png", hint: "person smiling" },
  { name: "Beta Builder", bio: "Building in public. Let's connect!", avatar: "https://placehold.co/48x48.png", hint: "person thinking" },
  { name: "Gamma Go-Getter", bio: "Productivity enthusiast.", avatar: "https://placehold.co/48x48.png", hint: "person reading" },
  { name: "Delta Dynamo", bio: "Just here to get things done.", avatar: "https://placehold.co/48x48.png", hint: "person coding" },
];

const activityFeedData = [
    { user: "Alpha Achiever", action: "completed a 7-day habit streak!", time: "2m ago", avatar: "https://placehold.co/40x40.png", hint: "person smiling" },
    { user: "Beta Builder", action: "started a new competition with Gamma Go-Getter.", time: "15m ago", avatar: "https://placehold.co/40x40.png", hint: "person thinking" },
    { user: "ScaleUp User", action: "added a new goal: 'Master AI Prompting'.", time: "1h ago", avatar: "https://placehold.co/40x40.png", hint: "profile avatar" },
    { user: "Delta Dynamo", action: "completed 5 tasks.", time: "3h ago", avatar: "https://placehold.co/40x40.png", hint: "person coding" },
];

export default function SocialPage() {
  const [communityMembers, setCommunityMembers] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setCommunityMembers(communityMembersData);
      setActivityFeed(activityFeedData);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Rss className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>Activity Feed</CardTitle>
                        <CardDescription>See what's happening in the community.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-grow">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/4" />
                            </div>
                        </div>
                      ))
                    ) : (
                      activityFeed.map((activity, index) => (
                          <div key={index} className="flex items-start gap-4">
                              <Avatar>
                                  <AvatarImage src={activity.avatar} data-ai-hint={activity.hint} />
                                  <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                  <p><span className="font-semibold text-primary-foreground">{activity.user}</span> {activity.action}</p>
                                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                              </div>
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
                    <UserPlus className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>Find Members</CardTitle>
                        <CardDescription>Connect with other achievers.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Input placeholder="Search for members..." />
                </div>
                <div className="space-y-4">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2 flex-grow">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-3 w-3/4" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                      ))
                    ) : (
                      communityMembers.map((member) => (
                          <div key={member.name} className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                  <AvatarImage src={member.avatar} data-ai-hint={member.hint} />
                                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                  <p className="font-semibold">{member.name}</p>
                                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                              </div>
                              <Button size="sm" variant="outline" className="ml-auto">Follow</Button>
                          </div>
                      ))
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
