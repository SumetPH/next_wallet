import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const schema = z.object({
      name: z.string(),
      categoryTypeId: z.number(),
    });

    const body = await schema.parseAsync(await req.json());

    const createCategory = await sql`
      INSERT INTO category
        (name, category_type_id)
      VALUES
        (${body.name}, ${body.categoryTypeId})
      RETURNING *
    `;

    return Response.json(createCategory[0]);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
