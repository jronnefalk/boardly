import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserInfo } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const { user } = await getUserInfo();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pinnedItem = await prisma.pinnedItem.findUnique({
        where: { id: params.id },
    });

    if (pinnedItem?.userId !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.pinnedItem.delete({
        where: { id: params.id },
    });

    return NextResponse.json({ message: 'Unpinned successfully' });
}
