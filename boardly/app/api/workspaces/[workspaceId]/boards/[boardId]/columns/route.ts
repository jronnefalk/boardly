import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/logActivity';

export async function GET(request: Request, { params }: { params: { boardId: string } }) {
  try {
    const { boardId } = params;

    if (!boardId) {
      return NextResponse.json({ error: 'Board ID is required' }, { status: 400 });
    }

    const columns = await prisma.column.findMany({
      where: { boardId },
      include: { cards: true }, 
    });

    return NextResponse.json(columns, { status: 200 });
  } catch (error) {
    console.error('Error fetching columns:', error);
    return NextResponse.json({ error: 'Error fetching columns' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { boardId: string } }) {
  try {
    const { name, position } = await request.json();
    const { boardId } = params;

    if (!name || !position) {
      return NextResponse.json({ error: 'Name and position are required' }, { status: 400 });
    }

    const newColumn = await prisma.column.create({
      data: {
        name,
        position,
        boardId,
      },
    });

    await logActivity("created column", `created list "${name}"`, boardId, newColumn.id);

    return NextResponse.json(newColumn, { status: 201 });
  } catch (error) {
    console.error('Error creating column:', error);
    return NextResponse.json({ error: 'Error creating column' }, { status: 500 });
  }
}
