// src/app/api/classes/route.ts
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const classes = await prisma.class.findMany({
      where: { user_id: parseInt(userId, 10) }, // Convert to integer if userId is a string
    });
    return NextResponse.json(classes, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching classes' }, { status: 500 });
  }
}
