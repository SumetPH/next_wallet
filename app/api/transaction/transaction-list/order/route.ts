import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const accountId = req.nextUrl.searchParams.get("accountId");

    const expenseList = await sql`
      select 
        t.id as id,
        t.amount as amount,
        t.transaction_type_id as transaction_type_id,
        tt.name as transaction_type_name,
        t.category_id as category_id,
        c.name as category_name,
        a.id as account_id,
        a.name as account_name,
        to_char(t.updated_at, 'YYYY-MM-DD') as date,
        to_char(t.updated_at, 'HH24:MI') as time 
      from 
        transaction t 
      left join 
        transaction_type tt
      on tt.id = t.transaction_type_id
      left join
        category c
      on c.id = t.category_id
      left join 
        expense e
      on e.transaction_id = t.id
      left join 
        account a
      on a.id = e.account_id
      where t.transaction_type_id = 1
      ${accountId ? sql`and a.id = ${accountId}` : sql``}
    `;

    const expenseBalance = expenseList
      .reduce((p, c) => p + Number(c.amount), 0)
      .toFixed(2);

    const incomeList = await sql`
      select 
        t.id as id,
        t.amount as amount,
        t.transaction_type_id as transaction_type_id,
        tt.name as transaction_type_name,
        t.category_id as category_id,
        c.name as category_name,
        a.id as account_id,
        a.name as account_name,
        to_char(t.updated_at, 'YYYY-MM-DD') as date,
        to_char(t.updated_at, 'HH24:MI') as time 
      from 
        transaction t 
      left join 
        transaction_type tt
      on tt.id = t.transaction_type_id
      left join
        category c
      on c.id = t.category_id
      left join 
        income i
      on i.transaction_id = t.id
      left join 
        account a
      on a.id = i.account_id
      where t.transaction_type_id = 2
      ${accountId ? sql`and a.id = ${accountId}` : sql``}
    `;

    const incomeBalance = incomeList
      .reduce((p, c) => p + Number(c.amount), 0)
      .toFixed(2);

    const transferList = await sql`
      select 
        t.id as id,
        t.amount as amount,
        t.transaction_type_id as transaction_type_id,
        tt.name as transaction_type_name,
        t.category_id as category_id,
        c.name as category_name,
        af.id as account_id_from,
        af.name as account_name_from,
        at.id as account_id_to,
        at.name as account_name_to,
        to_char(t.updated_at, 'YYYY-MM-DD') as date,
        to_char(t.updated_at, 'HH24:MI') as time 
      from 
        transaction t 
      left join 
        transaction_type tt
      on tt.id = t.transaction_type_id
      left join
        category c
      on c.id = t.category_id
      left join 
        transfer tf
      on tf.transaction_id = t.id
      left join 
        account af
      on af.id = tf.account_id_from
      left join
        account at
      on at.id = tf.account_id_to
      where t.transaction_type_id = 3
      ${
        accountId
          ? sql`and af.id = ${accountId} or at.id = ${accountId}`
          : sql``
      }
    `;
    const transferBalance = transferList
      .reduce((p, c) => p + Number(c.amount), 0)
      .toFixed(2);

    const debtList = await sql`
      select 
        t.id as id,
        t.amount as amount,
        t.transaction_type_id as transaction_type_id,
        tt.name as transaction_type_name,
        t.category_id as category_id,
        c.name as category_name,
        af.id as account_id_from,
        af.name as account_name_from,
        at.id as account_id_to,
        at.name as account_name_to,
        to_char(t.updated_at, 'YYYY-MM-DD') as date,
        to_char(t.updated_at, 'HH24:MI') as time 
      from 
        transaction t 
      left join 
        transaction_type tt
      on tt.id = t.transaction_type_id
      left join
        category c
      on c.id = t.category_id
      left join 
        debt d
      on d.transaction_id = t.id
      left join 
        account af
      on af.id = d.account_id_from
      left join
        account at
      on at.id = d.account_id_to
      where t.transaction_type_id = 4
      ${
        accountId
          ? sql`and af.id = ${accountId} or at.id = ${accountId}`
          : sql``
      }
    `;
    const debtBalance = debtList
      .reduce((p, c) => p + Number(c.amount), 0)
      .toFixed(2);

    return Response.json({
      expenseBalance,
      expenseList,
      incomeBalance,
      incomeList,
      transferBalance,
      transferList,
      debtBalance,
      debtList,
    });
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
