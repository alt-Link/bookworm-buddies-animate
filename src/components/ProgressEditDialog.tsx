import React, { useState, useEffect } from 'react';
import { Star, Clock, FileText, Target, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Book, ReadingStatus } from './BookCard';
import { toast } from '@/hooks/use-toast';

interface ProgressEditDialogProps {
  book: Book;
  readingStatus: ReadingStatus;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedStatus: ReadingStatus) => void;
}

export function ProgressEditDialog({ book, readingStatus, isOpen, onClose, onSave }: ProgressEditDialogProps) {
  const [currentPage, setCurrentPage] = useState(readingStatus.currentPage || 0);
  const [personalRating, setPersonalRating] = useState(readingStatus.personalRating || 0);
  const [notes, setNotes] = useState(readingStatus.notes || '');
  const [readingGoal, setReadingGoal] = useState(readingStatus.readingGoal || '');
  const [minutesRead, setMinutesRead] = useState(0);

  const totalPages = book.pageCount || 0;
  const progressPercentage = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(readingStatus.currentPage || 0);
      setPersonalRating(readingStatus.personalRating || 0);
      setNotes(readingStatus.notes || '');
      setReadingGoal(readingStatus.readingGoal || '');
      setMinutesRead(0);
    }
  }, [isOpen, readingStatus]);

  const handleSave = () => {
    const now = new Date().toISOString();
    const updatedStatus: ReadingStatus = {
      ...readingStatus,
      currentPage,
      personalRating: personalRating > 0 ? personalRating : undefined,
      notes: notes.trim() || undefined,
      readingGoal: readingGoal.trim() || undefined,
      lastUpdated: now,
    };

    // Add reading session if minutes were logged
    if (minutesRead > 0) {
      const sessions = readingStatus.readingSessions || [];
      sessions.push({
        date: now,
        minutes: minutesRead,
        pagesRead: currentPage - (readingStatus.currentPage || 0),
      });
      updatedStatus.readingSessions = sessions;
    }

    // Auto-complete if reached the end
    if (totalPages > 0 && currentPage >= totalPages && readingStatus.status !== 'read') {
      updatedStatus.status = 'read';
      updatedStatus.dateCompleted = now;
      toast({
        title: "🎉 Book Completed!",
        description: `Congratulations on finishing "${book.title}"!`,
      });
    }

    onSave(updatedStatus);
    onClose();
    
    toast({
      title: "Progress Updated",
      description: `Your reading progress has been saved.`,
    });
  };

  const renderStarRating = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setPersonalRating(star === personalRating ? 0 : star)}
            className="transition-colors hover:scale-110 transform transition-transform"
          >
            <Star
              className={`w-6 h-6 ${
                star <= personalRating
                  ? 'fill-accent text-accent'
                  : 'fill-none text-muted-foreground hover:text-accent'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getProgressColor = () => {
    if (progressPercentage >= 75) return 'bg-green-500';
    if (progressPercentage >= 50) return 'bg-blue-500';
    if (progressPercentage >= 25) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Update Reading Progress</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Book Info */}
          <Card className="bg-gradient-warm border-0">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-16 h-24 bg-muted rounded-lg overflow-hidden">
                  {book.imageLinks?.thumbnail ? (
                    <img
                      src={book.imageLinks.thumbnail}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-warm flex items-center justify-center">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{book.title}</h3>
                  {book.authors && (
                    <p className="text-sm text-muted-foreground">by {book.authors.join(', ')}</p>
                  )}
                  {totalPages > 0 && (
                    <Badge variant="secondary" className="mt-2">
                      {totalPages} pages
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <Label className="text-base font-semibold">Reading Progress</Label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Label htmlFor="currentPage" className="min-w-0 flex-shrink-0">
                  Current Page:
                </Label>
                <Input
                  id="currentPage"
                  type="number"
                  min="0"
                  max={totalPages || undefined}
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24"
                />
                {totalPages > 0 && (
                  <span className="text-sm text-muted-foreground">
                    of {totalPages} ({progressPercentage}%)
                  </span>
                )}
              </div>

              {totalPages > 0 && (
                <div className="space-y-2">
                  <Progress value={progressPercentage} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Start</span>
                    <span className="font-medium">{progressPercentage}% Complete</span>
                    <span>Finish</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reading Session */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <Label className="text-base font-semibold">Reading Session</Label>
            </div>

            <div className="flex items-center gap-4">
              <Label htmlFor="minutesRead">Minutes read today:</Label>
              <Input
                id="minutesRead"
                type="number"
                min="0"
                value={minutesRead}
                onChange={(e) => setMinutesRead(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          </div>

          {/* Personal Rating */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              <Label className="text-base font-semibold">Your Rating</Label>
            </div>

            <div className="flex items-center gap-4">
              {renderStarRating()}
              {personalRating > 0 && (
                <span className="text-sm text-muted-foreground">
                  {personalRating} out of 5 stars
                </span>
              )}
            </div>
          </div>

          {/* Reading Goal */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <Label htmlFor="readingGoal" className="text-base font-semibold">
                Reading Goal
              </Label>
            </div>

            <Input
              id="readingGoal"
              placeholder="e.g., Finish by end of month, Read 30 minutes daily..."
              value={readingGoal}
              onChange={(e) => setReadingGoal(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <Label htmlFor="notes" className="text-base font-semibold">
                Reading Notes
              </Label>
            </div>

            <Textarea
              id="notes"
              placeholder="Your thoughts, favorite quotes, key insights..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSave} className="flex-1" variant="default">
              <Save className="w-4 h-4" />
              Save Progress
            </Button>
            <Button onClick={onClose} variant="outline">
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}