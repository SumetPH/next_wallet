import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const orderSchema = z.object({
      categoryId: z.number(),
      order: z.number(),
    });

    const schema = z.object({
      list: z.array(orderSchema),
    });

    const body = await schema.parseAsync(await req.json());

    await sql.begin(async (sql) => {
      for (const order of body.list) {
        await sql`
          update category
          set "order"=${order.order}
          where id=${order.categoryId}
        `;
      }
    });

    return Response.json("reorder");
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
