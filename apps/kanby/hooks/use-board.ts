import { useState, useEffect, useCallback } from 'react';
import { Board, Column, Card, LocalStorageData } from '../lib/types';
import { CryptoService, EncryptedData } from '../lib/crypto';
import { nanoid } from 'nanoid';

const STORAGE_KEY = 'kanby_data';

export function useBoard(boardId?: string) {
  const [board, setBoard] = useState<Board | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFromLocalStorage = useCallback((): LocalStorageData => {
    if (typeof window === 'undefined') {
      return { boards: {}, currentBoardId: null, encryptionKeys: {} };
    }
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { boards: {}, currentBoardId: null, encryptionKeys: {} };
    }
    
    try {
      return JSON.parse(stored) as LocalStorageData;
    } catch {
      return { boards: {}, currentBoardId: null, encryptionKeys: {} };
    }
  }, []);

  const saveToLocalStorage = useCallback((data: LocalStorageData) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, []);

  const createBoard = useCallback(async (title: string = 'Untitled Board') => {
    const newBoardId = await CryptoService.generateBoardId();
    const newKey = await CryptoService.generateEncryptionKey();
    
    const newBoard: Board = {
      id: newBoardId,
      title,
      columns: [
        { id: nanoid(), title: 'To Do', position: 0, cards: [] },
        { id: nanoid(), title: 'In Progress', position: 1, cards: [] },
        { id: nanoid(), title: 'Done', position: 2, cards: [] }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const data = loadFromLocalStorage();
    data.boards[newBoardId] = newBoard;
    data.encryptionKeys[newBoardId] = newKey;
    data.currentBoardId = newBoardId;
    saveToLocalStorage(data);

    setBoard(newBoard);
    setEncryptionKey(newKey);
    
    return { boardId: newBoardId, encryptionKey: newKey };
  }, [loadFromLocalStorage, saveToLocalStorage]);

  const loadBoard = useCallback(async (id: string, key?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = loadFromLocalStorage();
      
      if (data.boards[id]) {
        setBoard(data.boards[id]);
        setEncryptionKey(key || data.encryptionKeys[id] || null);
      } else if (key) {
        const response = await fetch(`/api/boards/${id}`);
        if (response.ok) {
          const encryptedBoard = await response.json() as EncryptedData;
          const decryptedData = await CryptoService.decrypt(encryptedBoard, key);
          const boardData = JSON.parse(decryptedData) as Board;
          
          data.boards[id] = boardData;
          data.encryptionKeys[id] = key;
          saveToLocalStorage(data);
          
          setBoard(boardData);
          setEncryptionKey(key);
        } else {
          throw new Error('Board not found');
        }
      } else {
        throw new Error('Board not found locally and no encryption key provided');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board');
    } finally {
      setLoading(false);
    }
  }, [loadFromLocalStorage, saveToLocalStorage]);

  const updateBoard = useCallback((updater: (board: Board) => Board) => {
    if (!board) return;
    
    const updatedBoard = updater(board);
    updatedBoard.updatedAt = new Date();
    
    const data = loadFromLocalStorage();
    data.boards[updatedBoard.id] = updatedBoard;
    saveToLocalStorage(data);
    
    setBoard(updatedBoard);
  }, [board, loadFromLocalStorage, saveToLocalStorage]);

  const addColumn = useCallback((title: string) => {
    updateBoard(board => ({
      ...board,
      columns: [
        ...board.columns,
        {
          id: nanoid(),
          title,
          position: board.columns.length,
          cards: []
        }
      ]
    }));
  }, [updateBoard]);

  const addCard = useCallback((columnId: string, title: string, description?: string) => {
    updateBoard(board => ({
      ...board,
      columns: board.columns.map(col => 
        col.id === columnId
          ? {
              ...col,
              cards: [
                ...col.cards,
                {
                  id: nanoid(),
                  title,
                  description,
                  columnId,
                  position: col.cards.length,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
              ]
            }
          : col
      )
    }));
  }, [updateBoard]);

  const moveCard = useCallback((cardId: string, toColumnId: string, toPosition: number) => {
    updateBoard(board => {
      let card: Card | undefined;
      
      const columns = board.columns.map(col => ({
        ...col,
        cards: col.cards.filter(c => {
          if (c.id === cardId) {
            card = c;
            return false;
          }
          return true;
        })
      }));

      if (!card) return board;

      return {
        ...board,
        columns: columns.map(col => {
          if (col.id === toColumnId) {
            const newCards = [...col.cards];
            newCards.splice(toPosition, 0, { ...card!, columnId: toColumnId, position: toPosition });
            return {
              ...col,
              cards: newCards.map((c, i) => ({ ...c, position: i }))
            };
          }
          return col;
        })
      };
    });
  }, [updateBoard]);

  const syncToServer = useCallback(async () => {
    if (!board || !encryptionKey) return;
    
    try {
      const encryptedData = await CryptoService.encrypt(JSON.stringify(board), encryptionKey);
      
      await fetch(`/api/boards/${board.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encryptedData)
      });

      updateBoard(b => ({ ...b, lastSyncedAt: new Date() }));
    } catch (err) {
      console.error('Failed to sync board:', err);
    }
  }, [board, encryptionKey, updateBoard]);

  useEffect(() => {
    const urlKey = CryptoService.extractKeyFromUrl();
    
    if (boardId) {
      loadBoard(boardId, urlKey || undefined);
    } else if (!board) {
      const data = loadFromLocalStorage();
      if (data.currentBoardId && data.boards[data.currentBoardId]) {
        setBoard(data.boards[data.currentBoardId]);
        setEncryptionKey(data.encryptionKeys[data.currentBoardId] || null);
      }
      setLoading(false);
    }
  }, [boardId]);

  return {
    board,
    encryptionKey,
    loading,
    error,
    createBoard,
    loadBoard,
    updateBoard,
    addColumn,
    addCard,
    moveCard,
    syncToServer,
    shareLink: board && encryptionKey 
      ? CryptoService.generateShareLink(board.id, encryptionKey)
      : null
  };
}