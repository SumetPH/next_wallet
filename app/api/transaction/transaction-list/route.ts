import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const accountId = req.nextUrl.searchParams.get("accountId");
    const categoryId = req.nextUrl.searchParams.get("categoryId");
    const startDate = req.nextUrl.searchParams.get("startDate");
    const endDate = req.nextUrl.searchParams.get("endDate");

    const transactionList = await sql`
      select 
        to_char(date_trunc('day', t.updated_at), 'YYYY-MM-DD') as day,
        json_agg(
          json_build_object(
            'id', t.id,
            'amount', t.amount,
            'note', t.note,
            'updated_at', t.updated_at,
            'created_at', t.created_at,
            'transaction_type_id', tt.id,
            'transaction_type_name', tt.name,
            'category_id', c.id,
            'category_name', c.name,
            'category_type_id', ct.id,
            'category_type_name', ct.name,
            'account_id_from', af.id,
            'account_id_from_name', af.name,
            'account_id_to', at.id,
            'account_id_to_name', at.name,
            'date', to_char(t.updated_at, 'YYYY-MM-DD'),
            'time', to_char(t.updated_at, 'HH24:MI')
          )
          order by t.updated_at desc
        ) as transaction_list
      from "transaction" t 
      left join transaction_type tt on tt.id = t.transaction_type_id
      left join category c on c.id = t.category_id
      left join category_type ct on ct.id = c.category_type_id
      left join account af on af.id = t.account_id_from
      left join account at on at.id = t.account_id_to
      where 1 = 1
     ${
       accountId
         ? sql`and (af.id = ${accountId} or at.id = ${accountId})`
         : sql``
     }
      ${
        categoryId
          ? sql`and t.category_id in ${sql(categoryId.split(","))}`
          : sql``
      }
      ${startDate ? sql`and t.updated_at >= ${startDate}::date` : sql``}
      ${
        endDate
          ? sql`and t.updated_at < (${endDate}::date + interval '1 day')`
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
