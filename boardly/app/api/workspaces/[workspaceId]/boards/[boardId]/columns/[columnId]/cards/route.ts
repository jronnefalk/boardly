import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: { columnId: string } }) {
  try {
    const { content, position } = await request.json();
    const { columnId } = params;

    if (!columnId) {
      return NextResponse.json({ error: 'Column ID is required' }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (typeof position !== 'number') {
      return NextResponse.json({ error: 'Position must be a number' }, { status: 400 });
    }

    const newCard = await prisma.card.create({
      data: {
        content,
        position,
        columnId,
      },
    });

    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json({ error: 'Error creating card' }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { columnId: string } }) {
  try {
    const { columnId } = params;

    if (!columnId) {
      return NextResponse.json({ error: 'Column ID is required' }, { status: 400 });
    }

    const cards = await prisma.card.findMany({
      where: { columnId },
    });

    return NextResponse.json(cards, { status: 200 });
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json({ error: 'Error fetching cards' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Extract cardId and columnId from request body
    const { cardId } = await request.json();

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    // Log to verify the cardId is correct
    console.log("Deleting card with ID:", cardId);

    // Perform the deletion
    await prisma.card.delete({
      where: { id: cardId },
    });

    return NextResponse.json({ message: 'Card deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting card' }, { status: 500 });
  }
}