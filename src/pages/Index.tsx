import React, { useState, useEffect } from 'react';
import { BookOpen, Search as SearchIcon, Library, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BookSearch } from '@/components/BookSearch';
import { MyLibrary } from '@/components/MyLibrary';
import { Book, ReadingStatus } from '@/components/BookCard';
import heroImage from '@/assets/hero-library.jpg';

const Index = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [libraryBooks, setLibraryBooks] = useState(new Map<string, { book: Book; status: ReadingStatus }>());

  // Load library from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('reading-library');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLibraryBooks(new Map(Object.entries(parsed)));
      } catch (error) {
        console.error('Failed to load library:', error);
      }
    }
  }, []);

  // Save library to localStorage when it changes
  useEffect(() => {
    const libraryObject = Object.fromEntries(libraryBooks.entries());
    localStorage.setItem('reading-library', JSON.stringify(libraryObject));
  }, [libraryBooks]);

  const handleAddToLibrary = (book: Book) => {
    const status: ReadingStatus = {
      status: 'reading',
      dateAdded: new Date().toISOString(),
    };

    setLibraryBooks(prev => new Map(prev.set(book.id, { book, status })));
    setActiveTab('library');
  };

  const handleStatusChange = (bookId: string, status: ReadingStatus) => {
    setLibraryBooks(prev => {
      const existing = prev.get(bookId);
      if (existing) {
        return new Map(prev.set(bookId, { ...existing, status }));
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60" />
        <div className="relative h-full flex items-center justify-center text-center text-primary-foreground p-6">
          <div className="max-w-4xl space-y-6 animate-slide-up">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-12 h-12 animate-float" />
              <Sparkles className="w-8 h-8 text-accent animate-float" style={{ animationDelay: '1s' }} />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              My Reading
              <span className="bg-gradient-to-r from-accent to-primary-glow bg-clip-text text-transparent"> Journey</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto">
              Discover, track, and celebrate your love for books. Build your personal library and never lose track of your reading adventures.
            </p>
            <div className="flex gap-4 justify-center mt-8">
              <Button 
                variant="hero" 
                size="lg" 
                onClick={() => setActiveTab('search')}
                className="text-lg px-8 py-3"
              >
                <SearchIcon className="w-5 h-5" />
                Discover Books
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => setActiveTab('library')}
                className="text-lg px-8 py-3"
              >
                <Library className="w-5 h-5" />
                My Library ({libraryBooks.size})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-card border border-border h-12">
            <TabsTrigger 
              value="search" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base"
            >
              <SearchIcon className="w-4 h-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger 
              value="library" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base"
            >
              <Library className="w-4 h-4 mr-2" />
              My Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-foreground">Discover Your Next Great Read</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Search through millions of books and add them to your personal library. Track what you want to read, what you're currently reading, and celebrate what you've completed.
              </p>
            </div>
            <BookSearch onAddToLibrary={handleAddToLibrary} libraryBooks={libraryBooks} />
          </TabsContent>

          <TabsContent value="library" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-foreground">Your Personal Library</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Track your reading progress, see your statistics, and manage your book collection all in one place.
              </p>
            </div>
            <MyLibrary 
              libraryBooks={libraryBooks} 
              onStatusChange={handleStatusChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
