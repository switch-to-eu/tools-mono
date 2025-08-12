'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanCard } from './kanban-card';
import { Column as ColumnType } from '../lib/types';
import { Button } from '@workspace/ui/components/button';
import { Input } from './ui/input';
import { Plus, X } from 'lucide-react';

interface ColumnProps {
  column: ColumnType;
  onAddCard: (title: string) => void;
  onEditCard: (cardId: string, title: string, description?: string) => void;
  onDeleteCard: (cardId: string) => void;
}

export function Column({ column, onAddCard, onEditCard, onDeleteCard }: ColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCard();
    } else if (e.key === 'Escape') {
      setIsAddingCard(false);
      setNewCardTitle('');
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-4 ${
        isOver ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          {column.title}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {column.cards.length} {column.cards.length === 1 ? 'card' : 'cards'}
        </span>
      </div>

      <div className="space-y-2">
        <SortableContext
          items={column.cards.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map(card => (
            <KanbanCard
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}
        </SortableContext>

        {isAddingCard ? (
          <div className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
            <Input
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter card title..."
              className="mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddCard}>
                Add Card
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => setIsAddingCard(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add a card
          </Button>
        )}
      </div>
    </div>
  );
}