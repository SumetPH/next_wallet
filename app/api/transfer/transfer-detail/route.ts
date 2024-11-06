import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const transactionId = await z
      .string()
      .parseAsync(req.nextUrl.searchParams.get("transactionId") || null);

    const detail = await sql`
     SELECT 
      t.id as id,
      t.amount as amount,
      t.note as note,
      t.transaction_type_id as transaction_type_id,
      t.category_id as category_id,
      to_char(t.updated_at, 'YYYY-MM-DD') as date,
      to_char(t.updated_at, 'HH24:MI:SS') as time
     FROM transaction t WHERE id=${transactionId} limit 1
    `;

    if (detail.length > 0) {
      const transfer = await sql`
        SELECT
          af.id as account_id_from,
          af.name as account_name_from,
          at.id as account_id_to,
          at.name as account_name_to
        FROM transfer
        LEFT JOIN account af
          on af.id = transfer.account_id_from
        LEFT JOIN account at
          on at.id = transfer.account_id_to
        WHERE transaction_id = ${transactionId}
        LIMIT 1
      `;

      detail[0].account_id_from = transfer[0].account_id_from;
      detail[0].account_name_from = transfer[0].account_name_from;
      detail[0].account_id_to = transfer[0].account_id_to;
      detail[0].account_name_to = transfer[0].account_name_to;
      return Response.json(detail[0]);
    } else {
      return Response.json(
        { message: "Transaction not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
