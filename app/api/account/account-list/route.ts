import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const schema = z.object({
      type: z.array(z.number()).optional(),
    });

    const body = await schema.parseAsync(await req.json());

    const accountList = await sql`
        SELECT 
          a.id,
          a.name,
          a.amount,
          a.account_type_id,
          at.name AS account_type_name,
          (
            a.amount -- initial
            -
            COALESCE (
              (
                SELECT SUM(t.amount) 
                FROM transaction t 
                LEFT JOIN expense e 
                ON e.transaction_id = t.id
                WHERE t.transaction_type_id = 1 AND e.account_id = a.id
              ),0
            ) -- expense
            +
            COALESCE (
              (
                SELECT SUM(t.amount) 
                FROM transaction t 
                  LEFT JOIN income i 
                ON i.transaction_id = t.id
                WHERE t.transaction_type_id = 2	AND i.account_id = a.id		
              ),0
            ) -- income
            -
            COALESCE (
              (
                SELECT SUM(t.amount) 
                FROM transaction t 
                LEFT JOIN transfer tf
                ON tf.transaction_id = t.id
                WHERE t.transaction_type_id = 3 AND tf.account_id_from = a.id 
              ),0
            ) -- transfer out
            +
            COALESCE (
              (
                SELECT SUM(t.amount) 
                FROM transaction t 
                LEFT JOIN transfer tf
                ON tf.transaction_id = t.id
                WHERE t.transaction_type_id = 3 AND tf.account_id_to = a.id 
              ),0
            ) -- transfer IN
            -
            COALESCE (
              (
                SELECT SUM(t.amount) 
                FROM transaction t 
                LEFT JOIN debt d
                ON d.transaction_id = t.id
                WHERE t.transaction_type_id = 4 AND d.account_id_from = a.id 
              ),0
            ) -- debt out
            +
            COALESCE (
              (
                SELECT SUM(t.amount) 
                FROM transaction t 
                LEFT JOIN debt d
                ON d.transaction_id = t.id
                WHERE t.transaction_type_id = 4 AND d.account_id_to = a.id 
              ),0
            ) -- debt in
          ) AS balance
        FROM account a
        LEFT JOIN account_type at ON at.id = a.account_type_id
        ${body.type ? sql`WHERE account_type_id IN ${sql([body.type])}` : sql``}
        ORDER BY a.name
    `;

    return Response.json(accountList);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
