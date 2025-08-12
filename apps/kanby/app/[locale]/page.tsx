'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KanbanBoard } from '../../components/kanban-board';
import { useBoard } from '../../hooks/use-board';
import { Button } from '@workspace/ui/components/button';
import { Share2, Save, Plus, Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  const router = useRouter();
  const {
    board,
    loading,
    error,
    createBoard,
    addColumn,
    addCard,
    moveCard,
    syncToServer,
    shareLink,
    updateBoard,
  } = useBoard();

  useEffect(() => {
    if (!loading && !board && !error) {
      createBoard('My Private Board');
    }
  }, [loading, board, error, createBoard]);

  const handleShare = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      toast.success('Share link copied to clipboard! This link includes the encryption key.');
    }
  };

  const handleSync = async () => {
    await syncToServer();
    toast.success('Board synced to server (encrypted)');
  };

  const handleNewBoard = async () => {
    const title = prompt('Enter board title:');
    if (title) {
      const { boardId } = await createBoard(title);
      router.push(`/board/${boardId}`);
    }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your secure board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={() => createBoard('New Board')} className="mt-4">
            Create New Board
          </Button>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-center">
            <Shield className="h-16 w-16 text-primary-color" />
          </div>
          
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Kanby
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Privacy-focused Kanban board with zero-knowledge encryption
            </p>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-left space-y-3">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold">End-to-End Encryption</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your data is encrypted on your device before any storage
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold">Zero-Knowledge</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Server never sees your unencrypted data
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Share2 className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-semibold">Anonymous Sharing</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Share boards without creating accounts
                </p>
              </div>
            </div>
          </div>

          <Button onClick={() => createBoard('My Private Board')} size="lg" className="w-full">
            <Plus className="mr-2 h-5 w-5" />
            Create Your Private Board
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b bg-white dark:bg-gray-900 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-semibold">{board.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🔒 End-to-end encrypted • No account required
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNewBoard} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Board
            </Button>
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