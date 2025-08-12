export interface Card {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: string;
  position: number;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  createdAt: Date;
  updatedAt: Date;
  lastSyncedAt?: Date;
}

export interface EncryptedBoard {
  id: string;
  encryptedData: string;
  salt: string;
  iv: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocalStorageData {
  boards: Record<string, Board>;
  currentBoardId: string | null;
  encryptionKeys: Record<string, string>;
}

export interface DragEvent {
  active: {
    id: string;
    data: {
      current?: {
        sortable: {
          index: number;
        };
      };
    };
  };
  over: {
    id: string;
    data: {
      current?: {
        sortable: {
          index: number;
        };
      };
    };
  } | null;
}