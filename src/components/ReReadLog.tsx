import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, RotateCcw, Star, Clock, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Book, ReadingStatus } from './BookCard';

interface ReReadEntry {
  id: string;
  dateStarted?: string;
  dateCompleted?: string;
  rating?: number;
  notes?: string;
  readingTime?: number; // minutes
}

interface ReReadLogProps {
  book: Book;
  status: ReadingStatus;
  onStatusChange: (bookId: string, status: ReadingStatus) => void;
}

export function ReReadLog({ book, status, onStatusChange }: ReReadLogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ReReadEntry | null>(null);
  const [newEntry, setNewEntry] = useState<Partial<ReReadEntry>>({});
  const [selectedDate, setSelectedDate] = useState<Date>();

  const reReadEntries = status.reReadDates || [];

  const handleAddReRead = () => {
    if (!newEntry.dateCompleted && !selectedDate) return;

    const entry: ReReadEntry = {
      id: Date.now().toString(),
      dateCompleted: selectedDate?.toISOString() || newEntry.dateCompleted,
      dateStarted: newEntry.dateStarted,
      rating: newEntry.rating,
      notes: newEntry.notes,
      readingTime: newEntry.readingTime,
    };

    const updatedStatus: ReadingStatus = {
      ...status,
      status: 're-read',
      reReadDates: [...reReadEntries, entry]
    };

    onStatusChange(book.id, updatedStatus);
    setNewEntry({});
    setSelectedDate(undefined);
    setIsOpen(false);
  };

  const handleEditEntry = (entry: ReReadEntry) => {
    setEditingEntry(entry);
    setNewEntry(entry);
    setSelectedDate(entry.dateCompleted ? new Date(entry.dateCompleted) : undefined);
    setIsOpen(true);
  };

  const handleUpdateEntry = () => {
    if (!editingEntry) return;

    const updatedEntries = reReadEntries.map(entry => 
      entry.id === editingEntry.id 
        ? { 
            ...entry, 
            ...newEntry,
            dateCompleted: selectedDate?.toISOString() || newEntry.dateCompleted
          }
        : entry
    );

    const updatedStatus: ReadingStatus = {
      ...status,
      reReadDates: updatedEntries
    };

    onStatusChange(book.id, updatedStatus);
    setEditingEntry(null);
    setNewEntry({});
    setSelectedDate(undefined);
    setIsOpen(false);
  };

  const handleDeleteEntry = (entryId: string) => {
    const updatedEntries = reReadEntries.filter(entry => entry.id !== entryId);
    
    const updatedStatus: ReadingStatus = {
      ...status,
      reReadDates: updatedEntries,
      status: updatedEntries.length > 0 ? 're-read' : status.status
    };

    onStatusChange(book.id, updatedStatus);
  };

  const renderStars = (rating: number, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange?.(star)}
            className={cn(
              "text-lg transition-colors",
              star <= rating 
                ? "text-yellow-400 hover:text-yellow-500" 
                : "text-muted-foreground hover:text-yellow-300",
              onRatingChange && "cursor-pointer"
            )}
            disabled={!onRatingChange}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Re-read History
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => {
                setEditingEntry(null);
                setNewEntry({});
                setSelectedDate(undefined);
              }}>
                <Plus className="w-4 h-4 mr-1" />
                Add Re-read
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? 'Edit Re-read Entry' : 'Add Re-read Entry'}
                </DialogTitle>
                <DialogDescription>
                  Track when you re-read "{book.title}" and add your thoughts.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Completion Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Rating</Label>
                  {renderStars(newEntry.rating || 0, (rating) => 
                    setNewEntry(prev => ({ ...prev, rating }))
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Reading Time (minutes)</Label>
                  <Input
                    type="number"
                    placeholder="Total time spent re-reading"
                    value={newEntry.readingTime || ''}
                    onChange={(e) => setNewEntry(prev => ({ 
                      ...prev, 
                      readingTime: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="What did you think on this re-read? Any new insights?"
                    value={newEntry.notes || ''}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={editingEntry ? handleUpdateEntry : handleAddReRead}
                  disabled={!selectedDate}
                >
                  {editingEntry ? 'Update' : 'Add'} Re-read
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {reReadEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <RotateCcw className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No re-reads logged yet</p>
            <p className="text-sm">Click "Add Re-read" to track when you read this book again</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reReadEntries
              .sort((a, b) => new Date(b.dateCompleted || 0).getTime() - new Date(a.dateCompleted || 0).getTime())
              .map((entry, index) => (
                <Card key={entry.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="secondary">
                          Re-read #{reReadEntries.length - index}
                        </Badge>
                        {entry.dateCompleted && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CalendarIcon className="w-3 h-3" />
                            {format(new Date(entry.dateCompleted), "MMM d, yyyy")}
                          </div>
                        )}
                        {entry.readingTime && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {entry.readingTime}m
                          </div>
                        )}
                      </div>
                      
                      {entry.rating && (
                        <div className="flex items-center gap-2">
                          {renderStars(entry.rating)}
                          <span className="text-sm text-muted-foreground">
                            ({entry.rating}/5 stars)
                          </span>
                        </div>
                      )}
                      
                      {entry.notes && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">{entry.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEntry(entry)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}