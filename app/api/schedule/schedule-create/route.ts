import sql from "@/config/db";
import { z } from "zod";

/**
 * API endpoint to create a new schedule and its recurring transactions
 *
 * @param request - HTTP request object containing schedule details in body:
 *   - name: string - Name of the schedule
 *   - amount: number - Amount for each scheduled transaction
 *   - start_date: string - Start date in YYYY-MM-DD format
 *   - end_date: string - End date in YYYY-MM-DD format
 *   - transaction_type_id: number - ID of the transaction type
 *
 * @returns Response with:
 *   - 200: "schedule created" on success
 *   - 500: Error object if validation or database error occurs
 */
export async function POST(request: Request) {
  try {
    // Define validation schema for request body
    const schema = z.object({
      name: z.string(),
      amount: z.number(),
      start_date: z.string(),
      end_date: z.string(),
      transaction_type_id: z.number(),
    });

    // Parse and validate request body
    const body = await schema.parseAsync(await request.json());

    // Create new schedule record
    const createSchedule = await sql`
      insert into schedule (name, start_date, end_date, amount, transaction_type_id)
      values (${body.name}, ${body.start_date}, ${body.end_date}, ${body.amount}, ${body.transaction_type_id})
      returning *
    `;

    // Create schedule_transaction records for each month between start and end date
    const createScheduleTransaction = await sql`
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

    // Return success response
    return Response.json("schedule created");
  } catch (error) {
    // Log and return any errors
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
