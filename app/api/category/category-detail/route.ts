import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const categoryId = await z
      .string()
      .parseAsync(req.nextUrl.searchParams.get("categoryId") || null);

    const detailCategory = await sql`
      SELECT 
        *
      FROM category c WHERE id=${categoryId} limit 1
    `;

    if (detailCategory.length === 0) {
      return Response.json("category not found", { status: 404 });
    }

    return Response.json(detailCategory[0]);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
