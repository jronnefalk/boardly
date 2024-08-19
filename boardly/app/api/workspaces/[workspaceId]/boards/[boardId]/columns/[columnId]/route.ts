import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { columnId: string } }) {
  try {
    const { columnId } = params;

    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: { cards: true }, 
    });

    if (!column) {
      return NextResponse.json({ error: 'Column not found' }, { status: 404 });
    }

    return NextResponse.json(column, { status: 200 });
  } catch (error) {
    console.error('Error fetching column:', error);
    return NextResponse.json({ error: 'Error fetching column' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { columnId: string } }) {
  try {
    const { columnId } = params;
    const { position, name } = await request.json();

    const updateData: any = {};
    if (position !== undefined) {
      updateData.position = position;
    }
    if (name) {
      updateData.name = name;
    }

    const updatedColumn = await prisma.column.update({
      where: { id: columnId },
      data: updateData,
    });

    return NextResponse.json(updatedColumn, { status: 200 });
  } catch (error) {
    console.error('Error updating column:', error);
    return NextResponse.json({ error: 'Error updating column' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { columnId: string } }) {
  try {
    const { columnId } = params;

    await prisma.card.deleteMany({
      where: { columnId },
    });

    await prisma.column.delete({
      where: { id: columnId },
    });

    return NextResponse.json({ message: 'Column and its cards deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting column:', error);
    return NextResponse.json({ error: 'Error deleting column' }, { status: 500 });
  }
}
