import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const schema = z.object({
      name: z.string(),
      amount: z.number(),
      startDate: z.number(),
      categoryId: z.array(z.number()),
    });

    const body = await schema.parseAsync(await req.json());

    const createBudget = await sql`
      insert into budget (name, amount, start_date)
      values (${body.name}, ${body.amount}, ${body.startDate})
      returning *
    `;

    for (const id of body.categoryId) {
      await sql`
        insert into budget_category (budget_id, category_id)
        values (${createBudget[0].id}, ${id})
        returning *
      `;
    }

    return Response.json(createBudget[0]);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
