import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Book as BookType, ReadingStatus } from './BookCard';

interface ReadingHeatmapProps {
  libraryBooks: Map<string, { book: BookType; status: ReadingStatus }>;
}

interface DayActivity {
  date: string;
  intensity: number; // 0-4 based on reading activity
  sessions: number;
  books: string[];
}

export function ReadingHeatmap({ libraryBooks }: ReadingHeatmapProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const heatmapData = useMemo(() => {
    const activityMap = new Map<string, DayActivity>();
    
    // Process all reading sessions
    Array.from(libraryBooks.values()).forEach(({ book, status }) => {
      if (status.readingSessions) {
        status.readingSessions.forEach(session => {
          const dateKey = new Date(session.date).toDateString();
          const existing = activityMap.get(dateKey) || {
            date: dateKey,
            intensity: 0,
            sessions: 0,
            books: []
          };
          
          existing.sessions += 1;
          if (!existing.books.includes(book.title)) {
            existing.books.push(book.title);
          }
          
          // Calculate intensity based on reading time
          const timeIntensity = Math.min(Math.floor(session.minutes / 15), 4);
          existing.intensity = Math.max(existing.intensity, timeIntensity);
          
          activityMap.set(dateKey, existing);
        });
      }
      
      // Add completion dates
      if (status.dateCompleted) {
        const dateKey = new Date(status.dateCompleted).toDateString();
        const existing = activityMap.get(dateKey) || {
          date: dateKey,
          intensity: 0,
          sessions: 0,
          books: []
        };
        
        existing.intensity = Math.max(existing.intensity, 3); // Completion is high intensity
        if (!existing.books.includes(book.title)) {
          existing.books.push(book.title);
        }
        
        activityMap.set(dateKey, existing);
      }
      
      // Add re-read dates
      if (status.reReadDates) {
        status.reReadDates.forEach(reRead => {
          if (reRead.dateCompleted) {
            const dateKey = new Date(reRead.dateCompleted).toDateString();
            const existing = activityMap.get(dateKey) || {
              date: dateKey,
              intensity: 0,
              sessions: 0,
              books: []
            };
            
            existing.intensity = Math.max(existing.intensity, 4); // Re-read completion is highest
            if (!existing.books.includes(book.title)) {
              existing.books.push(book.title);
            }
            
            activityMap.set(dateKey, existing);
          }
        });
      }
    });
    
    return activityMap;
  }, [libraryBooks]);

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const weeks = [];
    let currentWeek = new Array(7).fill(null);
    
    // Fill in the days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = (startDayOfWeek + day - 1) % 7;
      const dateKey = date.toDateString();
      
      currentWeek[dayOfWeek] = {
        day,
        date: dateKey,
        activity: heatmapData.get(dateKey) || null
      };
      
      // Start new week on Sunday
      if (dayOfWeek === 6) {
        weeks.push(currentWeek);
        currentWeek = new Array(7).fill(null);
      }
    }
    
    // Add last partial week if needed
    if (currentWeek.some(day => day !== null)) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [currentDate, heatmapData]);

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 0: return 'bg-muted/30';
      case 1: return 'bg-green-200';
      case 2: return 'bg-green-300';
      case 3: return 'bg-green-400';
      case 4: return 'bg-green-500';
      default: return 'bg-muted/30';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const totalDaysRead = heatmapData.size;
  const totalSessions = Array.from(heatmapData.values()).reduce((acc, day) => acc + day.sessions, 0);
  const currentStreak = useMemo(() => {
    const sortedDates = Array.from(heatmapData.keys())
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const date = new Date(sortedDates[i]);
      date.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, [heatmapData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Reading Heatmap
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-sm font-medium min-w-[120px] text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {totalDaysRead} days read
          </div>
          <div className="flex items-center gap-1">
            <Book className="w-4 h-4" />
            {totalSessions} sessions
          </div>
          {currentStreak > 0 && (
            <div>
              🔥 {currentStreak} day streak
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="h-6 flex items-center justify-center">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="space-y-1">
          {monthData.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day, dayIndex) => (
                <div key={dayIndex} className="relative group">
                  {day ? (
                    <div 
                      className={`
                        h-8 w-full rounded border border-border flex items-center justify-center
                        text-xs font-medium cursor-pointer transition-all duration-200
                        hover:ring-2 hover:ring-primary/50 hover:scale-110
                        ${day.activity ? getIntensityColor(day.activity.intensity) : 'bg-muted/30'}
                        ${day.activity ? 'text-foreground' : 'text-muted-foreground'}
                      `}
                      title={day.activity ? 
                        `${day.day}: ${day.activity.sessions} sessions, ${day.activity.books.join(', ')}` : 
                        `${day.day}: No reading activity`
                      }
                    >
                      {day.day}
                    </div>
                  ) : (
                    <div className="h-8 w-full" />
                  )}
                  
                  {/* Tooltip */}
                  {day?.activity && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      <div className="bg-popover text-popover-foreground border rounded p-2 text-xs shadow-lg min-w-[200px]">
                        <div className="font-medium">{new Date(day.date).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          {day.activity.sessions} reading session{day.activity.sessions !== 1 ? 's' : ''}
                        </div>
                        <div className="mt-1">
                          <div className="text-xs font-medium">Books:</div>
                          {day.activity.books.map(book => (
                            <div key={book} className="text-xs text-muted-foreground truncate">
                              {book}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(intensity => (
              <div 
                key={intensity}
                className={`w-3 h-3 rounded ${getIntensityColor(intensity)} border border-border`}
              />
            ))}
          </div>
          <span className="text-muted-foreground">More</span>
        </div>
      </CardContent>
    </Card>
  );
}