import React, { useState, useCallback } from 'react';
import { Search, Loader2, BookOpen, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookCard, Book } from './BookCard';
import { toast } from '@/hooks/use-toast';

interface BookSearchProps {
  onAddToLibrary: (book: Book) => void;
  libraryBooks: Map<string, any>;
}

interface GoogleBooksResponse {
  items?: {
    id: string;
    volumeInfo: {
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
    };
  }[];
}

const popularGenres = [
  'Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy', 
  'Thriller', 'Biography', 'History', 'Self Help', 'Business',
  'Psychology', 'Philosophy', 'Art', 'Cooking', 'Health'
];

export function BookSearch({ onAddToLibrary, libraryBooks }: BookSearchProps) {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const searchBooks = useCallback(async (searchQuery: string, isGenreSearch = false) => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a book title, author, or keyword to search.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      // For genre searches, use subject parameter for better results
      const queryParam = isGenreSearch ? `subject:${encodeURIComponent(searchQuery)}` : encodeURIComponent(searchQuery);
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${queryParam}&maxResults=20&orderBy=relevance&key=AIzaSyDNSS-5GTP3_W-v1X-aYcV8MyVgsDUuYdg`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: GoogleBooksResponse = await response.json();
      
      const searchResults: Book[] = data.items?.map(item => ({
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors,
        description: item.volumeInfo.description,
        imageLinks: item.volumeInfo.imageLinks,
        publishedDate: item.volumeInfo.publishedDate,
        averageRating: item.volumeInfo.averageRating,
        pageCount: item.volumeInfo.pageCount,
        categories: item.volumeInfo.categories,
      })) || [];

      setBooks(searchResults);

      if (searchResults.length === 0) {
        toast({
          title: "No Results",
          description: "No books found for your search. Try different keywords.",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search books. Please try again.",
        variant: "destructive"
      });
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedGenre(null);
    searchBooks(query);
  };

  const handleGenreClick = (genre: string) => {
    setSelectedGenre(genre);
    setQuery('');
    searchBooks(genre, true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="bg-gradient-warm border-0 shadow-book">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for books by title, author, or keyword..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 h-12 text-lg bg-background border-border focus:ring-accent"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search Books
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Genre Browsing */}
      {!hasSearched && (
        <Card className="bg-card border-border shadow-md">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Browse by Genre</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularGenres.map((genre) => (
                  <Badge
                    key={genre}
                    variant={selectedGenre === genre ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1"
                    onClick={() => handleGenreClick(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Searching the world's libraries...</p>
          </div>
        </div>
      )}

      {!isLoading && hasSearched && books.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">No books found</h3>
            <p className="text-muted-foreground">Try searching with different keywords</p>
          </div>
        </div>
      )}

      {books.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              {selectedGenre ? `${selectedGenre} Books` : 'Search Results'}
            </h2>
            <span className="text-muted-foreground">{books.length} books found</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                readingStatus={libraryBooks.get(book.id)}
                onStatusChange={() => {}} // Not used in search context
                onAddToLibrary={onAddToLibrary}
                compact={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}