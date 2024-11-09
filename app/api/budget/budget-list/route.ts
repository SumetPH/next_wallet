import { NextRequest } from "next/server";
import sql from "@/config/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const budgetList = await sql`
      select 
        b.id,
        b.name,
        b.amount,
        coalesce(
          (
            select sum(t.amount) 
            from "transaction" t 
            where t.category_id in (
              select bc.category_id 
              from budget_category bc 
              where bc.budget_id = b.id
            )
          ),0.00
        ) as balance,
        b.created_at,
        b.updated_at 
      from budget b 
      order by b.name
    `;

    return Response.json(budgetList);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
