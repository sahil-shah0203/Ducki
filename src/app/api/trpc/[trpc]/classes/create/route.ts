// src/app/api/classes/create/route.ts
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { className } = await req.json();

  try {
    const newClass = await prisma.class.create({
      data: {
        class_name: className,
        user_id: parseInt(userId, 10), // Convert to integer if userId is a string
      },
    });
    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating class' }, { status: 500 });
  }
}
