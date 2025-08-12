'use client';

import { use } from 'react';
import { KanbanBoard } from '../../../components/kanban-board';
import { useBoard } from '../../../hooks/use-board';
import { Button } from '@workspace/ui/components/button';
import { Share2, Save, Home, Shield } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BoardPage({ params }: PageProps) {
  const { id } = use(params);
  const {
    board,
    loading,
    error,
    addColumn,
    addCard,
    moveCard,
    syncToServer,
    shareLink,
    updateBoard,
  } = useBoard(id);

  const handleShare = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      toast.success('Share link copied! Anyone with this link can view and edit the board.');
    }
  };

  const handleSync = async () => {
    await syncToServer();
    toast.success('Board synced securely to server');
  };

  const handleEditCard = (cardId: string, title: string, description?: string) => {
    if (!board) return;
    
    updateBoard(b => ({
      ...b,
      columns: b.columns.map(col => ({
        ...col,
        cards: col.cards.map(card => 
          card.id === cardId 
            ? { ...card, title, description, updatedAt: new Date() }
            : card
        )
      }))
    }));
  };

  const handleDeleteCard = (cardId: string) => {
    if (!board) return;
    
    updateBoard(b => ({
      ...b,
      columns: b.columns.map(col => ({
        ...col,
        cards: col.cards.filter(card => card.id !== cardId)
      }))
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary-color mx-auto animate-pulse" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Decrypting board...</p>
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Board Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'This board doesn\'t exist or you don\'t have the encryption key to access it.'}
          </p>
          <Link href="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b bg-white dark:bg-gray-900 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">{board.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                🔒 Encrypted board • ID: {board.id}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSync} variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" />
              Sync
            </Button>
            <Button onClick={handleShare} size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-950">
        <KanbanBoard
          board={board}
          onCardMove={moveCard}
          onAddCard={addCard}
          onAddColumn={addColumn}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
        />
      </div>
    </div>
  );
}