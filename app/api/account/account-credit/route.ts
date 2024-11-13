import { NextRequest } from "next/server";
import sql from "@/config/db";
import { date, z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const accountId = await z
      .string()
      .parseAsync(req.nextUrl.searchParams.get("accountId") || null);
    const creditStartDate = await z
      .string()
      .parseAsync(req.nextUrl.searchParams.get("creditStartDate") || null);

    const creditStartDateNumber = parseInt(creditStartDate) - 1;
    const datePeriod = await sql`
        select
          to_char((
            case 
              when extract(day from t.updated_at) > ${creditStartDateNumber}
              then date_trunc('month', t.updated_at) + (interval '1 days' * ${creditStartDateNumber})
              else date_trunc('month', t.updated_at) - interval '1 month' + (interval '1 days' * ${creditStartDateNumber})
            end
          ), 'YYYY-MM-DD') as date_period
        from "transaction" t 
        left join expense e 
        on e.transaction_id = t.id 
        left join debt d 
        on d.transaction_id = t.id 
        left join account adf
        on adf.id = d.account_id_from 
        left join account adt
        on adt.id = d.account_id_to 
        where e.account_id = ${accountId} or adf.id = ${accountId} or adt.id = ${accountId}
        group by date_period
        order by date_period
      `;

    if (datePeriod.length === 0) {
      return Response.json([]);
    }

    const startDatePeriod = datePeriod[0].date_period;
    const endDatePeriod = datePeriod[datePeriod.length - 1].date_period;

    const accountCredit = await sql`
      select
        to_char(date_period, 'DD/MM/YYYY') as start_date,
        to_char(date_period + interval '1 month' - interval '1 day', 'DD/MM/YYYY') as end_date,
        sum(
          case
            when ae.account_type_id = 3 or adf.account_type_id = 3
            then t.amount
            else 0
          end
        ) as expense,
        sum(
          case
            when adt.account_type_id = 3
            then t.amount
            else 0
          end
        ) as income
      from generate_series(
        ${startDatePeriod}::date,
        ${endDatePeriod}::date,
        '1 month'::interval
      ) as date_period
      left join (
        select * from transaction ts
        where ts.transaction_type_id in (1,4)
      ) t
      on (
        case
          when extract(day from t.updated_at) > ${creditStartDateNumber}
          then date_trunc('month', t.updated_at) + (interval '1 days' * ${creditStartDateNumber})
          else date_trunc('month', t.updated_at) - interval '1 month' + (interval '1 days' * ${creditStartDateNumber})
        end
      ) = date_period
      left join expense e
      on e.transaction_id = t.id
      left join (
        select * from account aes
        where aes.id = ${accountId}
      ) ae
      on ae.id = e.account_id
      left join debt d
      on d.transaction_id = t.id
      left join (
        select * from account adfs
        where adfs.id = ${accountId}
      ) adf
      on adf.id = d.account_id_from
      left join (
        select * from account adts
        where adts.id = ${accountId}
      ) adt
      on adt.id = d.account_id_to
      group by date_period
      order by date_period desc
    `;

    let income = 0;
    for (const account of accountCredit) {
      account.balance = (income - Number(account.expense)).toFixed(2);
      account.expense = (-1 * Number(account.expense)).toFixed(2);
      income = Number(account.income);
    }

    return Response.json(accountCredit);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
