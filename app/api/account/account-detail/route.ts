import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const accountId = await z
      .string()
      .parseAsync(req.nextUrl.searchParams.get("accountId") || null);

    const accountDetail = await sql`
     SELECT 
      a.id as id,
      a.name as name,
      a.amount as amount,
      a.account_type_id as account_type_id,
      a.created_at as created_at,
      a.updated_at as updated_at,
      a.order_index as order_index,
      a.icon_path as icon_path,
      ac.credit_start_date as credit_start_date
     FROM account a
     left join account_credit ac
     on ac.account_id = a.id
     WHERE a.id=${accountId}
     limit 1
    `;

    if (accountDetail.length === 0) {
      return Response.json({ message: "account not found" }, { status: 404 });
    }

    return Response.json(accountDetail[0]);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
