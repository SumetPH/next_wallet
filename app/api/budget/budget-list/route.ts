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
           	and (
              date_trunc('month', current_date)
              -
              interval '1 month'
              +
              interval '1 days' * (b.start_date - 1)  
            )::date <= t.updated_at
            and (
              date_trunc('month', current_date)
              +
              interval '1 days' * (b.start_date - 1) 
            )::date >= t.updated_at 
          ),0.00
        ) as balance,
        b.created_at,
        b.updated_at 
      from budget b 
      order by b.name
    `;

    for (const budget of budgetList) {
      const category = await sql`
        select 
          bc.budget_id,
          bc.category_id,
          c.name as category_name 
        from budget_category bc
        left join category c 
        on c.id = bc.category_id
        where bc.budget_id = ${budget.id}
      `;
      budget.category = category;
    }

    return Response.json(budgetList);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
