'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Column } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { Board, Card as CardType } from '../lib/types';
import { Button } from '@workspace/ui/components/button';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  board: Board;
  onCardMove: (cardId: string, toColumnId: string, toPosition: number) => void;
  onAddCard: (columnId: string, title: string) => void;
  onAddColumn: (title: string) => void;
  onEditCard: (cardId: string, title: string, description?: string) => void;
  onDeleteCard: (cardId: string) => void;
}

export function KanbanBoard({
  board,
  onCardMove,
  onAddCard,
  onAddColumn,
  onEditCard,
  onDeleteCard,
}: KanbanBoardProps) {
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeColumn = board.columns.find(col =>
      col.cards.some(card => card.id === active.id)
    );
    const card = activeColumn?.cards.find(c => c.id === active.id);
    setActiveCard(card || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveCard(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = board.columns.find(col =>
      col.cards.some(card => card.id === activeId)
    );
    
    let overColumn = board.columns.find(col =>
      col.cards.some(card => card.id === overId)
    );
    
    if (!overColumn) {
      overColumn = board.columns.find(col => col.id === overId);
    }

    if (!activeColumn || !overColumn) {
      setActiveCard(null);
      return;
    }

    if (activeColumn.id !== overColumn.id || activeId !== overId) {
      const activeCardIndex = activeColumn.cards.findIndex(c => c.id === activeId);
      const overCardIndex = overColumn.cards.findIndex(c => c.id === overId);
      
      const newIndex = overCardIndex === -1 ? overColumn.cards.length : overCardIndex;
      
      onCardMove(activeId, overColumn.id, newIndex);
    }

    setActiveCard(null);
  };

  const handleAddColumn = () => {
    const title = prompt('Enter column title:');
    if (title) {
      onAddColumn(title);
    }
  };

  return (
    <div className="flex h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 p-4 overflow-x-auto">
          {board.columns.map(column => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <SortableContext
                items={column.cards.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <Column
                  column={column}
                  onAddCard={(title) => onAddCard(column.id, title)}
                  onEditCard={onEditCard}
                  onDeleteCard={onDeleteCard}
                />
              </SortableContext>
            </div>
          ))}
          
          <div className="flex-shrink-0 w-80">
            <Button
              onClick={handleAddColumn}
              variant="outline"
              className="w-full h-12 border-dashed"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Column
            </Button>
          </div>
        </div>

        <DragOverlay>
          {activeCard ? (
            <KanbanCard
              card={activeCard}
              isDragging
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}