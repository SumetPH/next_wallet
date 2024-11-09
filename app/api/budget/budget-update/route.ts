import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const schema = z.object({
      budgetId: z.number(),
      name: z.string(),
      amount: z.number(),
      startDate: z.number(),
      categoryId: z.array(z.number()),
    });

    const body = await schema.parseAsync(await req.json());

    // update budget
    const updateBudget = await sql`
      update budget
      set name=${body.name}, amount=${body.amount}, start_date=${
      body.startDate
    }, updated_at=${new Date()}
      where id=${body.budgetId}
      returning *
    `;

    // delete budget category
    await sql`
      delete from budget_category
      where budget_id=${body.budgetId}
    `;

    // insert budget category
    for (const id of body.categoryId) {
      await sql`
        insert into budget_category (budget_id, category_id)
        values (${updateBudget[0].id}, ${id})
        returning *
      `;
    }

    return Response.json(updateBudget[0]);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
