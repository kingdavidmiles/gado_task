// app/api/tasks/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to get user from Authorization header
async function getUserFromHeader(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

// GET - fetch all tasks for logged-in user
export async function GET(req: Request) {
  const user = await getUserFromHeader(req);
  if (!user) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401 }
    );
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: user.id }, // only logged-in user's tasks
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        userId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch tasks" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


// POST - create a new task
export async function POST(req: Request) {
  const user = await getUserFromHeader(req);
  if (!user) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401 }
    );
  }

  const body = await req.json();
  const { title, description } = body;

  if (!title || !description) {
    return new NextResponse(
      JSON.stringify({ error: "Title and description required" }),
      { status: 400 }
    );
  }

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        userId: user.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create task" }),
      { status: 500 }
    );
  }
}

// DELETE - delete a task
export async function DELETE(req: Request) {
  const user = await getUserFromHeader(req);
  if (!user) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return new NextResponse(
      JSON.stringify({ error: "Task ID required" }),
      { status: 400 }
    );
  }

  try {
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task || task.userId !== user.id) {
      return new NextResponse(
        JSON.stringify({ error: "Not found or not allowed" }),
        { status: 404 }
      );
    }

    await prisma.task.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting task:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to delete task" }),
      { status: 500 }
    );
  }
}
