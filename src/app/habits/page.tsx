'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Repeat } from "lucide-react";

const habits = [
  { id: 'quran', name: "Read Quran Daily" },
  { id: 'dhikr', name: "Post Dhikr on TikTok" },
  { id: 'knowledge', name: "Seek New Knowledge" },
  { id: 'podcast', name: "Record Daily Tech Podcast" },
  { id: 'read', name: "Read Tech News" },
  { id: 'health', name: "Focus on Health" }
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HabitsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Habit Tracker</CardTitle>
        <CardDescription>Check off your habits to build a streak. Consistency is key!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-4 min-w-[600px]">
            <div />
            {days.map(day => (
              <div key={day} className="text-center font-bold text-muted-foreground">{day}</div>
            ))}
            {habits.map(habit => (
              <>
                <div key={habit.id} className="flex items-center font-medium text-right pr-4">
                  <Label htmlFor={`${habit.id}-${days[0]}`}>{habit.name}</Label>
                </div>
                {days.map(day => (
                  <div key={`${habit.id}-${day}`} className="flex items-center justify-center">
                    <Checkbox id={`${habit.id}-${day}`} aria-label={`Mark ${habit.name} as done for ${day}`} />
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
