import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const schema = z.object({
      categoryId: z.number(),
      name: z.string(),
      categoryTypeId: z.number(),
    });

    const body = await schema.parseAsync(await req.json());

    const updateCategory = await sql`
      UPDATE category 
      SET 
        name=${body.name}, 
        category_type_id=${body.categoryTypeId}, 
        updated_at=${new Date()} 
      WHERE id=${body.categoryId}
      RETURNING *
    `;

    return Response.json(updateCategory[0]);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
