import { NextRequest, NextResponse } from 'next/server';
import { EncryptedData } from '../../../../lib/crypto';

const boardStorage = new Map<string, EncryptedData>();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
  const encryptedBoard = boardStorage.get(id);
  
  if (!encryptedBoard) {
    return NextResponse.json(
      { error: 'Board not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(encryptedBoard);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
  try {
    const encryptedData = await request.json() as EncryptedData;
    
    if (!encryptedData.salt || !encryptedData.iv || !encryptedData.ciphertext) {
      return NextResponse.json(
        { error: 'Invalid encrypted data' },
        { status: 400 }
      );
    }
    
    boardStorage.set(id, encryptedData);
    
    return NextResponse.json({ 
      success: true,
      message: 'Board saved (encrypted)',
      boardId: id
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save board' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
  const deleted = boardStorage.delete(id);
  
  if (!deleted) {
    return NextResponse.json(
      { error: 'Board not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ 
    success: true,
    message: 'Board deleted' 
  });
}