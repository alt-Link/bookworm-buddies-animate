import React, { useState } from 'react';
import { Star, BookOpen, Calendar, Users, Tag, Plus, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Book, ReadingStatus } from './BookCard';
import { toast } from '@/hooks/use-toast';

interface BookDetailsModalProps {
  book: Book;
  readingStatus?: ReadingStatus;
  isOpen: boolean;
  onClose: () => void;
  onAddToLibrary: (book: Book) => void;
  onStatusChange: (bookId: string, status: ReadingStatus) => void;
}

export function BookDetailsModal({ 
  book, 
  readingStatus, 
  isOpen, 
  onClose, 
  onAddToLibrary,
  onStatusChange 
}: BookDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToLibrary = () => {
    const newStatus: ReadingStatus = {
      status: 'want-to-read',
      dateAdded: new Date().toISOString(),
    };
    
    onAddToLibrary(book);
    onStatusChange(book.id, newStatus);
    
    toast({
      title: "Added to Library",
      description: `"${book.title}" has been added to your library`,
    });
    
    onClose();
  };

  const handleStatusChange = async (newStatus: ReadingStatus['status']) => {
    setIsLoading(true);
    
    const updatedStatus: ReadingStatus = {
      ...readingStatus,
      status: newStatus,
      dateAdded: readingStatus?.dateAdded || new Date().toISOString(),
    };

    if (newStatus === 'reading' && !readingStatus?.dateStarted) {
      updatedStatus.dateStarted = new Date().toISOString();
    }
    
    if (newStatus === 'read') {
      updatedStatus.dateCompleted = new Date().toISOString();
      if (!readingStatus?.dateStarted) {
        updatedStatus.dateStarted = new Date().toISOString();
      }
    }

    onStatusChange(book.id, updatedStatus);
    
    toast({
      title: "Status Updated",
      description: `"${book.title}" marked as ${newStatus.replace('-', ' ')}`,
    });
    
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 500);
  };

  const getStatusColor = (status: ReadingStatus['status']) => {
    switch (status) {
      case 'want-to-read': return 'bg-accent';
      case 'reading': return 'bg-primary';
      case 'read': return 'bg-secondary';
      default: return 'bg-muted';
    }
  };

  const getStatusText = (status: ReadingStatus['status']) => {
    switch (status) {
      case 'want-to-read': return 'Want to Read';
      case 'reading': return 'Currently Reading';
      case 'read': return 'Read';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold">{book.title}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Book Cover */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-64 h-96 bg-gradient-warm rounded-lg overflow-hidden shadow-lg">
                  {book.imageLinks?.thumbnail ? (
                    <>
                      {!imageLoaded && (
                        <div className="absolute inset-0 bg-gradient-warm animate-shimmer bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] bg-[length:200%_100%]" />
                      )}
                      <img
                        src={book.imageLinks.thumbnail.replace('zoom=1', 'zoom=3')}
                        alt={book.title}
                        className={`w-full h-full object-contain transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setImageLoaded(true)}
                      />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-warm flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  
                  {readingStatus && (
                    <Badge className={`absolute top-3 right-3 ${getStatusColor(readingStatus.status)}`}>
                      {getStatusText(readingStatus.status)}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Book Information */}
              <div className="md:col-span-2 space-y-6">
                {/* Authors */}
                {book.authors && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Authors
                    </h3>
                    <p className="text-muted-foreground">{book.authors.join(', ')}</p>
                  </div>
                )}

                {/* Ratings */}
                <div className="flex items-center gap-6">
                  {book.averageRating && (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-accent text-accent" />
                      <span className="font-medium">{book.averageRating.toFixed(1)}</span>
                      <span className="text-muted-foreground text-sm">Google Books Rating</span>
                    </div>
                  )}
                  {readingStatus?.personalRating && (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-primary text-primary" />
                      <span className="font-medium">{readingStatus.personalRating}/5</span>
                      <span className="text-muted-foreground text-sm">Your Rating</span>
                    </div>
                  )}
                </div>

                {/* Book Details */}
                <div className="grid grid-cols-2 gap-4">
                  {book.publishedDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Published: {book.publishedDate}</span>
                    </div>
                  )}
                  {book.pageCount && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{book.pageCount} pages</span>
                    </div>
                  )}
                </div>

                {/* Categories */}
                {book.categories && book.categories.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {book.categories.map((category, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {book.description && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">Description</h3>
                    <div className="text-muted-foreground leading-relaxed">
                      {book.description.length > 500 ? (
                        <>
                          {book.description.substring(0, 500)}...
                        </>
                      ) : (
                        book.description
                      )}
                    </div>
                  </div>
                )}

                {/* Reading Progress */}
                {readingStatus?.status === 'reading' && book.pageCount && readingStatus.currentPage && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">Reading Progress</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Page {readingStatus.currentPage} of {book.pageCount}</span>
                        <span>{Math.round((readingStatus.currentPage / book.pageCount) * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(readingStatus.currentPage / book.pageCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Reading Notes */}
                {readingStatus?.notes && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">Your Notes</h3>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-muted-foreground italic">"{readingStatus.notes}"</p>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {!readingStatus ? (
                    <Button
                      onClick={handleAddToLibrary}
                      variant="hero"
                      className="flex-1"
                      disabled={isLoading}
                    >
                      <Plus className="w-4 h-4" />
                      Add to Library
                    </Button>
                  ) : (
                    <>
                      {readingStatus.status !== 'read' && (
                        <Button
                          onClick={() => handleStatusChange('read')}
                          variant="default"
                          className="flex-1"
                          disabled={isLoading}
                        >
                          <Check className="w-4 h-4" />
                          Mark as Read
                        </Button>
                      )}
                      
                      {readingStatus.status === 'want-to-read' && (
                        <Button
                          onClick={() => handleStatusChange('reading')}
                          variant="secondary"
                          className="flex-1"
                          disabled={isLoading}
                        >
                          <BookOpen className="w-4 h-4" />
                          Start Reading
                        </Button>
                      )}
                    </>
                  )}
                  
                  <Button
                    onClick={onClose}
                    variant="outline"
                  >
                    <X className="w-4 h-4" />
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}