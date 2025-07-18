import React, { useState, useMemo } from 'react';
import { Book, BookCard, ReadingStatus } from './BookCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Target, Trophy, Clock, Star, TrendingUp, Calendar, Timer, Zap } from 'lucide-react';

interface MyLibraryProps {
  libraryBooks: Map<string, { book: Book; status: ReadingStatus }>;
  onStatusChange: (bookId: string, status: ReadingStatus) => void;
}

export function MyLibrary({ libraryBooks, onStatusChange }: MyLibraryProps) {
  const [activeTab, setActiveTab] = useState('all');

  const stats = useMemo(() => {
    const books = Array.from(libraryBooks.values());
    const readBooks = books.filter(b => b.status.status === 'finished');
    const currentlyReading = books.filter(b => b.status.status === 'reading');
    const didNotFinish = books.filter(b => b.status.status === 'did-not-finish');
    const reRead = books.filter(b => b.status.status === 're-read');
    
    const totalPages = readBooks.reduce((acc, book) => {
      return acc + (book.book.pageCount || 0);
    }, 0);

    const currentYear = new Date().getFullYear();
    const booksThisYear = readBooks.filter(book => {
      const dateCompleted = book.status.dateCompleted;
      return dateCompleted && new Date(dateCompleted).getFullYear() === currentYear;
    }).length;

    // Calculate total reading time
    const totalReadingMinutes = books.reduce((acc, { status }) => {
      if (status.readingSessions) {
        return acc + status.readingSessions.reduce((sessionAcc, session) => sessionAcc + session.minutes, 0);
      }
      return acc;
    }, 0);

    // Calculate average reading progress for currently reading books
    const avgProgress = currentlyReading.length > 0 
      ? currentlyReading.reduce((acc, { book, status }) => {
          if (book.pageCount && status.currentPage) {
            return acc + (status.currentPage / book.pageCount);
          }
          return acc;
        }, 0) / currentlyReading.length * 100
      : 0;

    // Calculate reading streak (days with reading activity)
    const readingDays = new Set();
    books.forEach(({ status }) => {
      if (status.readingSessions) {
        status.readingSessions.forEach(session => {
          readingDays.add(new Date(session.date).toDateString());
        });
      }
    });

    return {
      totalBooks: books.length,
      readBooks: readBooks.length,
      currentlyReading: currentlyReading.length,
      didNotFinish: didNotFinish.length,
      reRead: reRead.length,
      totalPages,
      booksThisYear,
      totalReadingMinutes,
      avgProgress: Math.round(avgProgress),
      readingDays: readingDays.size,
    };
  }, [libraryBooks]);

  const filteredBooks = useMemo(() => {
    const books = Array.from(libraryBooks.values());
    switch (activeTab) {
      case 'reading':
        return books.filter(b => b.status.status === 'reading');
      case 'finished':
        return books.filter(b => b.status.status === 'finished').sort((a, b) => {
          // Sort by completion date, most recent first
          const dateA = a.status.dateCompleted ? new Date(a.status.dateCompleted).getTime() : 0;
          const dateB = b.status.dateCompleted ? new Date(b.status.dateCompleted).getTime() : 0;
          return dateB - dateA;
        });
      case 'did-not-finish':
        return books.filter(b => b.status.status === 'did-not-finish');
      case 're-read':
        return books.filter(b => b.status.status === 're-read');
      default:
        return books;
    }
  }, [libraryBooks, activeTab]);

  if (libraryBooks.size === 0) {
    return (
      <div className="text-center py-16 space-y-6">
        <div className="animate-float">
          <BookOpen className="w-24 h-24 text-muted-foreground mx-auto" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Start Your Reading Journey</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Search for books above to add them to your personal library and track your reading progress.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
          <Card className="bg-gradient-warm border-0">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-accent mx-auto mb-2" />
              <h3 className="font-semibold">Set Goals</h3>
              <p className="text-sm text-muted-foreground">Track your reading progress</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-warm border-0">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Earn Achievements</h3>
              <p className="text-sm text-muted-foreground">Celebrate reading milestones</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-warm border-0">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-primary-glow mx-auto mb-2" />
              <h3 className="font-semibold">Track Statistics</h3>
              <p className="text-sm text-muted-foreground">Monitor your reading habits</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-primary text-primary-foreground border-0 hover:scale-105 transition-transform duration-300">
          <CardContent className="p-4 text-center">
            <BookOpen className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
            <div className="text-xs opacity-90">Total Books</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-warm border-0 hover:scale-105 transition-transform duration-300">
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary">{stats.readBooks}</div>
            <div className="text-xs text-muted-foreground">Books Read</div>
          </CardContent>
        </Card>

        <Card className="bg-accent text-accent-foreground border-0 hover:scale-105 transition-transform duration-300">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.currentlyReading}</div>
            <div className="text-xs opacity-90">Reading Now</div>
          </CardContent>
        </Card>

        <Card className="bg-destructive border-0 hover:scale-105 transition-transform duration-300">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-destructive-foreground" />
            <div className="text-2xl font-bold text-destructive-foreground">{stats.didNotFinish}</div>
            <div className="text-xs text-destructive-foreground opacity-90">Did Not Finish</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-warm border-0 hover:scale-105 transition-transform duration-300">
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold text-primary">{stats.totalPages.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Pages Read</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-primary text-primary-foreground border-0 hover:scale-105 transition-transform duration-300">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.booksThisYear}</div>
            <div className="text-xs opacity-90">This Year</div>
          </CardContent>
        </Card>

        {stats.totalReadingMinutes > 0 && (
          <Card className="bg-gradient-warm border-0 hover:scale-105 transition-transform duration-300">
            <CardContent className="p-4 text-center">
              <Timer className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-primary">{Math.round(stats.totalReadingMinutes / 60)}</div>
              <div className="text-xs text-muted-foreground">Hours Read</div>
            </CardContent>
          </Card>
        )}

        {stats.currentlyReading > 0 && stats.avgProgress > 0 && (
          <Card className="bg-accent text-accent-foreground border-0 hover:scale-105 transition-transform duration-300">
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.avgProgress}%</div>
              <div className="text-xs opacity-90">Avg Progress</div>
            </CardContent>
          </Card>
        )}

        {stats.readingDays > 0 && (
          <Card className="bg-secondary border-0 hover:scale-105 transition-transform duration-300">
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-primary">{stats.readingDays}</div>
              <div className="text-xs text-muted-foreground">Reading Days</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Library Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-card border border-border">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            All ({stats.totalBooks})
          </TabsTrigger>
          <TabsTrigger value="reading" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            Reading ({stats.currentlyReading})
          </TabsTrigger>
          <TabsTrigger value="finished" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
            Finished ({stats.readBooks})
          </TabsTrigger>
          <TabsTrigger value="did-not-finish" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
            Did Not Finish ({stats.didNotFinish})
          </TabsTrigger>
          <TabsTrigger value="re-read" className="data-[state=active]:bg-muted data-[state=active]:text-foreground">
            Re-read ({stats.reRead})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {filteredBooks.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">No books in this category</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'reading' && "Start reading some books to see them here"}
                  {activeTab === 'finished' && "Mark books as finished to build your completed collection"}
                  {activeTab === 'did-not-finish' && "Books you didn't finish will appear here"}
                  {activeTab === 're-read' && "Books you've re-read will appear here"}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map(({ book, status }) => (
                <BookCard
                  key={book.id}
                  book={book}
                  readingStatus={status}
                  onStatusChange={onStatusChange}
                  onAddToLibrary={() => {}} // Not used in library context
                  compact={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}