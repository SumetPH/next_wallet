import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const accountId = req.nextUrl.searchParams.get("accountId");
    const categoryId = req.nextUrl.searchParams.get("categoryId");

    const transactionList = await sql`
      select 
        to_char(date_trunc('day', t.updated_at), 'YYYY-MM-DD') as day,
        json_agg(
          json_build_object(
            'id', t.id,
            'amount', TO_CHAR(t.amount, 'FM99999.00'),
            'transaction_type_id', t.transaction_type_id,
            'transaction_type_name', tt.name,
            'category_id', t.category_id,
            'category_name', c.name,
            'expense_account_id', ae.id,
            'expense_account_name', ae.name,
            'income_account_id', ai.id,
            'income_account_name', ai.name,
            'transfer_account_id_from', atff.id,
            'transfer_account_name_from', atff.name,
            'transfer_account_id_to', atft.id,
            'transfer_account_name_to', atft.name,
            'debt_account_id_from', adf.id,
            'debt_account_name_from', adf.name,
            'debt_account_id_to', adt.id,
            'debt_account_name_to', adt.name,
            'date', to_char(t.updated_at, 'YYYY-MM-DD'),
            'time', to_char(t.updated_at, 'HH24:MI')
          ) 
          order by t.updated_at
        ) as transaction_list
      from "transaction" t 
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
      left join debt d
        on d.transaction_id = t.id
      left join account adf
        on adf.id = d.account_id_from
      left join account adt
        on adt.id = d.account_id_to
      where 1 = 1
     ${
       accountId
         ? sql`and ae.id = ${accountId} or ai.id = ${accountId} or atff.id = ${accountId} or atft.id = ${accountId} or adf.id = ${accountId} or adt.id = ${accountId}`
         : sql``
     }
      ${
        categoryId
          ? sql`and t.category_id in ${sql(categoryId.split(","))}`
          : sql``
      }
      group by day
      order by day desc
    `;

    return Response.json(transactionList);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
