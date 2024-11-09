import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const budgetId = await z
      .string()
      .parseAsync(req.nextUrl.searchParams.get("budgetId") || null);

    const detailBudget = await sql`
      select 
        *
      from budget b
      where b.id=${budgetId} 
      limit 1
    `;

    if (detailBudget.length === 0) {
      return Response.json("budget not found", { status: 404 });
    } else {
      const budgetCategory = await sql`
        select 
          bc.budget_id,
          bc.category_id
        from budget_category bc
        where bc.budget_id=${budgetId}
      `;

      return Response.json({
        budget: detailBudget[0],
        category: budgetCategory,
      });
    }
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
