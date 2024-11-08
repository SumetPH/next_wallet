import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  try {
    const categoryId = await z
      .string()
      .parseAsync(req.nextUrl.searchParams.get("categoryId") || null);

    const deleteCategory = await sql`
      DELETE FROM category 
      WHERE id=${categoryId}
      RETURNING *
    `;

    if (deleteCategory.length === 0) {
      return Response.json("category not found", { status: 404 });
    }

    return Response.json(deleteCategory[0]);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
