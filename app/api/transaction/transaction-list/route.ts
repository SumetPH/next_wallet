import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const accountId = req.nextUrl.searchParams.get("accountId");

    const transactionList = await sql`
      select 
        t.id as id,
        t.amount as amount,
        t.transaction_type_id as transaction_type_id,
        tt.name as transaction_type_name,
        t.category_id as category_id,
        c.name as category_name,
        ae.id as account_expense_id,
        ae.name as account_expense_name,
        ai.id as account_income_id,
        ai.name as account_income_name,
        atff.id as account_transfer_from_id,
        atff.name as account_transfer_from_name,
        atft.id as account_transfer_to_id,
        atft.name as account_transfer_to_name,
        to_char(t.updated_at, 'YYYY-MM-DD') as date,
        to_char(t.updated_at, 'HH24:MI:SS') as time 
      from 
        "transaction" t
      left join transaction_type tt
        on tt.id = t.transaction_type_id 
      left join category c 
        on c.id = t.category_id 
      left join expense e
        on e.transaction_id = t.id
      left join account ae
        on ae.id = e.account_id 
      left join income i
        on i.transaction_id =t.id 
      left join account ai
        on ai.id = i.account_id 
      left join transfer tf
        on tf.transaction_id = t.id
      left join account atff
        on atff.id = tf.account_id_from
      left join account atft
        on atft.id = tf.account_id_to
      ${
        accountId
          ? sql`where ae.id = ${accountId} or ai.id = ${accountId} or atff.id = ${accountId} or atft.id = ${accountId}`
          : sql``
      }
      order by t.updated_at asc
    `;

    return Response.json(transactionList);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
