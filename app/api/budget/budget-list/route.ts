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
        b.start_date,
        coalesce(
          (
            select sum(t.amount)
            from "transaction" t
            join budget_category bc on bc.category_id = t.category_id
            where bc.budget_id = b.id
            and t.updated_at >= (
              date_trunc('month', 
                case 
                  when extract(day from current_date) < b.start_date 
                  then current_date - interval '1 month'
                  else current_date
                end
              ) + make_interval(days => b.start_date - 1)
            )::date
            and t.updated_at < (
              date_trunc('month',
                case 
                  when extract(day from current_date) < b.start_date 
                  then current_date - interval '1 month'
                  else current_date
                end
              ) + interval '1 month' + make_interval(days => b.start_date - 2)
            )::date
          ), 0.00
        ) as balance,
        b.created_at,
        b.updated_at,
        b.order_index 
      from budget b 
      order by b.order_index
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
