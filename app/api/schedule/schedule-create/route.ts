import sql from "@/config/db";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    // Define validation schema for request body
    const schema = z.object({
      name: z.string(),
      amount: z.number(),
      start_date: z.string(),
      end_date: z.string(),
      transaction_type_id: z.number(),
      expense_account_id: z.number().optional(),
      debt_account_id_from: z.number().optional(),
      debt_account_id_to: z.number().optional(),
    });

    // Parse and validate request body
    const body = await schema.parseAsync(await request.json());

    // Create new schedule record
    const createSchedule = await sql`
      insert into schedule (name, start_date, end_date, amount, transaction_type_id)
      values (${body.name}, ${body.start_date}, ${body.end_date}, ${body.amount}, ${body.transaction_type_id})
      returning *
    `;

    if (body.end_date) {
      // Create schedule_transaction records for each month between start and end date
      await sql`
      insert into schedule_transaction (schedule_id, date)
      select 
        s.id,
        series_date
      from schedule s
      cross join lateral generate_series(
        s.start_date,
        s.end_date,
        '1 month'::interval
      ) as series_date
       where s.id = ${createSchedule[0].id}
    `;
    } else {
      // Create schedule_transaction record for start date and add end date 1 year from start date
      await sql`
        insert into schedule_transaction (schedule_id, date)
        select 
          s.id,
          series_date
        from schedule s
        cross join lateral generate_series(
          s.start_date,
          s.start_date + interval '1 year',
          '1 month'::interval
        ) as series_date
         where s.id = ${createSchedule[0].id}
      `;
    }

    // create schedule_template_expanse
    if (body.transaction_type_id === 1) {
      await sql`
          insert into schedule_template_expense (schedule_id, account_id) 
          values (
            ${createSchedule[0].id}, 
            ${body.expense_account_id ?? null}
          )
        `;
    }

    // create schedule_template_debt
    if (body.transaction_type_id === 4) {
      await sql`
        insert into schedule_template_debt (schedule_id, account_id_from, account_id_to) 
        values (
          ${createSchedule[0].id}, 
          ${body.debt_account_id_from ?? null}, 
          ${body.debt_account_id_to ?? null}
        )
      `;
    }

    // Return success response
    return Response.json("schedule created");
  } catch (error) {
    // Log and return any errors
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
