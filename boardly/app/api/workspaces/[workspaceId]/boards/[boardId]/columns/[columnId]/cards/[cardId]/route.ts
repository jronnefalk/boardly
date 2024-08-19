import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { cardId: string } }) {
    try {
      const { cardId } = params;
      const { content, newColumnId, position } = await request.json();
  
      const updateData: any = {};
      if (newColumnId) {
        updateData.columnId = newColumnId;
      }
      if (position !== undefined) {
        updateData.position = position;
      }
      if (content) {
        updateData.content = content;
      }
  
      const updatedCard = await prisma.card.update({
        where: { id: cardId },
        data: updateData,
      });
  
      return NextResponse.json(updatedCard, { status: 200 });
    } catch (error) {
      console.error('Error updating card:', error);
      return NextResponse.json({ error: 'Error updating card' }, { status: 500 });
    }
  }
