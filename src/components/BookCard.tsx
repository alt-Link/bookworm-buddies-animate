import React, { useState } from 'react';
import { Heart, BookOpen, Check, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export interface Book {
  id: string;
  title: string;
  authors?: string[];
  description?: string;
  imageLinks?: {
    thumbnail?: string;
  };
  publishedDate?: string;
  averageRating?: number;
  pageCount?: number;
  categories?: string[];
}

export interface ReadingStatus {
  status: 'want-to-read' | 'reading' | 'read';
  dateAdded: string;
  dateStarted?: string;
  dateCompleted?: string;
  rating?: number;
}

interface BookCardProps {
  book: Book;
  readingStatus?: ReadingStatus;
  onStatusChange: (bookId: string, status: ReadingStatus) => void;
  onAddToLibrary: (book: Book) => void;
  compact?: boolean;
}

export function BookCard({ book, readingStatus, onStatusChange, onAddToLibrary, compact = false }: BookCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

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
      title: "Library Updated",
      description: `"${book.title}" marked as ${newStatus.replace('-', ' ')}`,
    });
    
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleAddToLibrary = () => {
    onAddToLibrary(book);
    handleStatusChange('want-to-read');
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
    <Card className={`group hover:shadow-book transition-all duration-500 hover:scale-[1.02] ${compact ? 'max-w-xs' : 'max-w-sm'} animate-slide-up overflow-hidden`}>
      <CardContent className="p-4">
        <div className={`flex ${compact ? 'gap-3' : 'flex-col gap-4'}`}>
          {/* Book Cover */}
          <div className={`relative ${compact ? 'w-16 h-24' : 'w-full h-64'} bg-gradient-warm rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300`}>
            {book.imageLinks?.thumbnail ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-warm animate-shimmer bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] bg-[length:200%_100%]" />
                )}
                <img
                  src={book.imageLinks.thumbnail.replace('zoom=1', 'zoom=2')}
                  alt={book.title}
                  className={`w-full h-full object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-110`}
                  onLoad={() => setImageLoaded(true)}
                />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-warm flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            
            {readingStatus && (
              <Badge className={`absolute top-2 right-2 ${getStatusColor(readingStatus.status)} text-xs`}>
                {getStatusText(readingStatus.status)}
              </Badge>
            )}
          </div>

          {/* Book Details */}
          <div className={`flex-1 ${compact ? '' : 'mt-2'}`}>
            <h3 className={`font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors ${compact ? 'text-sm' : 'text-lg'}`}>
              {book.title}
            </h3>
            
            {book.authors && (
              <p className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'} mt-1`}>
                by {book.authors.join(', ')}
              </p>
            )}

            {!compact && book.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                {book.description}
              </p>
            )}

            {!compact && (
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                {book.averageRating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-accent text-accent" />
                    <span>{book.averageRating.toFixed(1)}</span>
                  </div>
                )}
                {book.pageCount && <span>{book.pageCount} pages</span>}
                {book.publishedDate && <span>{book.publishedDate.split('-')[0]}</span>}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {!readingStatus ? (
          <Button
            onClick={handleAddToLibrary}
            variant="hero"
            size={compact ? "sm" : "default"}
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
                size={compact ? "sm" : "default"}
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
                size={compact ? "sm" : "default"}
                disabled={isLoading}
              >
                <BookOpen className="w-4 h-4" />
                Start Reading
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}