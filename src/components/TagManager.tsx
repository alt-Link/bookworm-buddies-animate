import React, { useState, useEffect } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface TagManagerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export const TagManager: React.FC<TagManagerProps> = ({ selectedTags, onTagsChange }) => {
  const [allTags, setAllTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Load tags from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('reading-tags');
    if (saved) {
      try {
        setAllTags(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    }
  }, []);

  // Save tags to localStorage
  useEffect(() => {
    localStorage.setItem('reading-tags', JSON.stringify(allTags));
  }, [allTags]);

  const handleAddTag = () => {
    if (newTag.trim() && !allTags.includes(newTag.trim())) {
      const tag = newTag.trim();
      setAllTags(prev => [...prev, tag]);
      onTagsChange([...selectedTags, tag]);
      setNewTag('');
    }
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setAllTags(prev => prev.filter(tag => tag !== tagToDelete));
    onTagsChange(selectedTags.filter(tag => tag !== tagToDelete));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Tags & Shelves
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new tag */}
        <div className="flex gap-2">
          <Input
            placeholder="Create new tag (e.g., 'Trauma-core', 'Space Westerns')"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            className="flex-1"
          />
          <Button onClick={handleAddTag} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Selected tags */}
        {selectedTags.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Selected:</p>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <Badge key={tag} variant="default" className="cursor-pointer">
                  {tag}
                  <X 
                    className="w-3 h-3 ml-1 hover:text-destructive" 
                    onClick={() => handleToggleTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Available tags */}
        {allTags.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Available tags:</p>
            <div className="flex flex-wrap gap-2">
              {allTags.filter(tag => !selectedTags.includes(tag)).map(tag => (
                <div key={tag} className="flex items-center gap-1">
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleToggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTag(tag)}
                    className="h-auto p-1"
                  >
                    <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {allTags.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tags created yet. Create your first custom shelf above!
          </p>
        )}
      </CardContent>
    </Card>
  );
};