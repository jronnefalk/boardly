import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserInfo } from '@/lib/auth';

export async function PATCH(request: Request) {
    const { orderedIds } = await request.json();

    try {
        for (let i = 0; i < orderedIds.length; i++) {
            const id = orderedIds[i];
            await prisma.pinnedItem.update({
                where: { id: id },
                data: { position: i + 1 },
            });
        }

        return NextResponse.json({ message: 'Reordered successfully' });
    } catch (error) {
        console.error("Error reordering pinned items:", error);
        return NextResponse.json({ error: 'Failed to reorder pinned items' }, { status: 500 });
    }
}
