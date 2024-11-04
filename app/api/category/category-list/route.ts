import { NextRequest } from "next/server";
import sql from "@/config/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const categoryTypeId = req.nextUrl.searchParams.get("categoryTypeId");

    const categoryList = await sql`
      SELECT * FROM category
      ${
        categoryTypeId ? sql`WHERE category_type_id = ${categoryTypeId}` : sql``
      }
    `;

    return Response.json(categoryList);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
