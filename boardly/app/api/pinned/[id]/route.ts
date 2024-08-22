import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.pinnedItem.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Unpinned successfully' });
    } catch (error) {
        console.error("Error unpinning item:", error);
        return NextResponse.json({ error: 'Failed to unpin item' }, { status: 500 });
    }
}

