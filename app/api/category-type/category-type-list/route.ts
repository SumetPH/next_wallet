import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const categoryTypeList = await sql`
      SELECT * FROM category_type
    `;

    return Response.json(categoryTypeList);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
