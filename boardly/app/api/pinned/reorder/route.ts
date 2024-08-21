import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserInfo } from '@/lib/auth';

export async function PATCH(request: Request) {
    const { orderedIds } = await request.json();
    const { user } = await getUserInfo();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update the positions of the pinned items
    for (let i = 0; i < orderedIds.length; i++) {
        await prisma.pinnedItem.update({
            where: { id: orderedIds[i] },
            data: { position: i + 1 },
        });
    }

    return NextResponse.json({ message: 'Reordered successfully' });
}
