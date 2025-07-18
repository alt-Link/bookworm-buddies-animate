import React, { useState } from 'react';
import { Heart, BookOpen, Check, Plus, Star, Edit, BarChart3, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ProgressEditDialog } from './ProgressEditDialog';
import { BookDetailsModal } from './BookDetailsModal';
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
  status: 'reading' | 'finished' | 'did-not-finish' | 're-read';
  dateAdded: string;
  dateStarted?: string;
  dateCompleted?: string;
  rating?: number;
  currentPage?: number;
  personalRating?: number;
  notes?: string;
  readingGoal?: string;
  readingSessions?: {
    date: string;
    minutes: number;
    pagesRead: number;
  }[];
  lastUpdated?: string;
  tags?: string[];
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
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [showBookDetails, setShowBookDetails] = useState(false);

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
    
    if (newStatus === 'finished' || newStatus === 'did-not-finish') {
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
    handleStatusChange('reading');
  };

  const handleProgressSave = (updatedStatus: ReadingStatus) => {
    onStatusChange(book.id, updatedStatus);
  };

  const getProgressPercentage = () => {
    if (!readingStatus?.currentPage || !book.pageCount) return 0;
    return Math.round((readingStatus.currentPage / book.pageCount) * 100);
  };

  const getStatusColor = (status: ReadingStatus['status']) => {
    switch (status) {
      case 'reading': return 'bg-primary';
      case 'finished': return 'bg-secondary';
      case 'did-not-finish': return 'bg-destructive';
      case 're-read': return 'bg-accent';
      default: return 'bg-muted';
    }
  };

  const getStatusText = (status: ReadingStatus['status']) => {
    switch (status) {
      case 'reading': return 'Currently Reading';
      case 'finished': return 'Finished';
      case 'did-not-finish': return 'Did Not Finish';
      case 're-read': return 'Re-read';
      default: return '';
    }
  };

  return (
    <Card className={`group hover:shadow-book transition-all duration-500 hover:scale-[1.02] ${compact ? 'max-w-xs' : 'max-w-sm'} animate-slide-up overflow-hidden`}>
      <CardContent className="p-4">
        <div className={`flex ${compact ? 'gap-3' : 'flex-col gap-4'}`}>
          {/* Book Cover */}
          <div className={`relative ${compact ? 'w-16 h-24' : 'w-full h-64'} bg-gradient-warm rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 p-2`}>
            {book.imageLinks?.thumbnail ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-warm animate-shimmer bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] bg-[length:200%_100%]" />
                )}
                 <img
                   src={book.imageLinks.thumbnail.replace('zoom=1', 'zoom=2')}
                   alt={book.title}
                   className={`w-full h-full object-contain transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105 rounded`}
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
            <h3 
              className={`font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors cursor-pointer ${compact ? 'text-sm' : 'text-lg'}`}
              onClick={() => setShowBookDetails(true)}
            >
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
                {readingStatus?.personalRating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <span>{readingStatus.personalRating}/5 (You)</span>
                  </div>
                )}
                {book.pageCount && <span>{book.pageCount} pages</span>}
                {book.publishedDate && <span>{book.publishedDate.split('-')[0]}</span>}
              </div>
            )}

            {/* Progress Bar for Reading Books */}
            {readingStatus?.status === 'reading' && book.pageCount && readingStatus.currentPage && (
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Page {readingStatus.currentPage} of {book.pageCount}</span>
                  <span>{getProgressPercentage()}%</span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
              </div>
            )}

            {/* Tags */}
            {!compact && readingStatus?.tags && readingStatus.tags.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex flex-wrap gap-1">
                  {readingStatus.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="w-2 h-2 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {readingStatus.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{readingStatus.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Reading Notes Preview */}
            {!compact && readingStatus?.notes && (
              <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                <div className="text-muted-foreground line-clamp-2">
                  "{readingStatus.notes.substring(0, 100)}{readingStatus.notes.length > 100 ? '...' : ''}"
                </div>
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
            {readingStatus.status === 'reading' && (
              <Button
                onClick={() => setShowProgressDialog(true)}
                variant="secondary"
                size={compact ? "sm" : "default"}
                className="flex-1"
              >
                <Edit className="w-4 h-4" />
                Update Progress
              </Button>
            )}
            
            {readingStatus.status !== 'finished' && readingStatus.status !== 'did-not-finish' && (
              <Button
                onClick={() => handleStatusChange('finished')}
                variant="default"
                size={compact ? "sm" : "default"}
                className={readingStatus.status === 'reading' ? "flex-1" : "flex-1"}
                disabled={isLoading}
              >
                <Check className="w-4 h-4" />
                Mark as Read
              </Button>
            )}
            

            {(readingStatus.status === 'finished' || readingStatus.status === 'did-not-finish' || readingStatus.status === 're-read') && readingStatus.notes && (
              <Button
                onClick={() => setShowProgressDialog(true)}
                variant="outline"
                size={compact ? "sm" : "default"}
                className="flex-1"
              >
                <BarChart3 className="w-4 h-4" />
                View Details
              </Button>
            )}
          </>
        )}

        {/* Progress Edit Dialog */}
         {readingStatus && (
           <ProgressEditDialog
             book={book}
             readingStatus={readingStatus}
             isOpen={showProgressDialog}
             onClose={() => setShowProgressDialog(false)}
             onSave={handleProgressSave}
           />
         )}

         {/* Book Details Modal */}
         <BookDetailsModal
           book={book}
           readingStatus={readingStatus}
           isOpen={showBookDetails}
           onClose={() => setShowBookDetails(false)}
           onAddToLibrary={onAddToLibrary}
           onStatusChange={onStatusChange}
         />
      </CardFooter>
    </Card>
  );
}