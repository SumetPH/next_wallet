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
      c.name as category_name,
      to_char(t.updated_at, 'YYYY-MM-DD') as date,
      to_char(t.updated_at, 'HH24:MI:SS') as time
     FROM transaction t 
     LEFT JOIN category c
     ON c.id = t.category_id
     WHERE t.id=${transactionId} limit 1
    `;

    if (detail.length > 0) {
      if (detail[0].transaction_type_id === 1) {
        const expense = await sql`
          SELECT 
            ae.id as account_id,
            ae.name as account_name
          FROM expense e
          LEFT JOIN account ae
            ON ae.id = e.account_id
          WHERE e.transaction_id = ${transactionId}
        `;
        detail[0].account_id = expense[0].account_id;
        detail[0].account_name = expense[0].account_name;
      } else {
        const income = await sql`
          SELECT 
            ai.id as account_id,
            ai.name as account_name
          FROM income i
          LEFT JOIN account ai
            ON ai.id = i.account_id
          WHERE i.transaction_id = ${transactionId}
        `;
        detail[0].account_id = income[0].account_id;
        detail[0].account_name = income[0].account_name;
      }
    } else {
      return Response.json(
        { message: "Transaction not found" },
        { status: 404 }
      );
    }

    return Response.json(detail[0]);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
