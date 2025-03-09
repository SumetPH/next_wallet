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
      where t.account_id_from = ${accountId} or t.account_id_to = ${accountId}
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
        to_char(date_period, 'YYYY-MM-DD') as start_date,
        to_char(date_period + interval '1 month' - interval '1 day', 'YYYY-MM-DD') as end_date,
       coalesce( (
          select sum(-t.amount)
          from transaction t
          where t.account_id_from = ${accountId} and t.updated_at >= date_period and t.updated_at < date_period + interval '1 month'
        ), 0.00) as expense,
        coalesce(
          (
          select sum(t.amount)
          from transaction t
          where t.account_id_to = ${accountId} and t.updated_at >= date_period and t.updated_at < date_period + interval '1 month'
        ), 0.00
        ) as income
      from generate_series(
        ${startDatePeriod}::date,
        ${endDatePeriod}::date,
        '1 month'::interval
      ) as date_period
      group by date_period
      order by date_period asc
    `;

    let balance = 0;
    let debt = 0;

    for (const i in accountCredit) {
      const index = parseInt(i);
      if (index === 0) {
        debt = Number(accountCredit[index].expense);
        accountCredit[index].balance = balance.toFixed(2);
        accountCredit[index].debt = debt;
      } else {
        balance = debt + Number(accountCredit[index].income);
        debt = balance + Number(accountCredit[index].expense);
        accountCredit[index].debt = debt.toFixed(2);
        accountCredit[index].balance = balance.toFixed(2);
      }
    }

    return Response.json(accountCredit.reverse());
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
