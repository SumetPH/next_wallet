import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  try {
    const budgetId = await z
      .string()
      .parseAsync(req.nextUrl.searchParams.get("budgetId") || null);

    const deleteBudget = await sql`
      delete from budget
      where id=${budgetId}
      returning *
    `;

    await sql`
      delete from budget_category
      where budget_id=${budgetId}
    `;

    if (deleteBudget.length === 0) {
      return Response.json("budget not found", { status: 404 });
    }

    return Response.json(deleteBudget[0]);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
