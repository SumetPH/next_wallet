import sql from "@/config/db";
import { NextRequest } from "next/server";
import { z } from "zod";

/**
 * API endpoint to get list of schedule transactions for a specific schedule
 *
 * @param request - NextRequest object containing:
 *   - scheduleId: string - ID of the schedule to get transactions for (in query params)
 *
 * @returns Response with:
 *   - 200: Array of schedule transaction objects containing:
 *     - id: number - Schedule transaction ID
 *     - amount: number - Amount for the scheduled transaction
 *     - date: string - Transaction date in YYYY-MM-DD format
 *     - status: string - Transaction status ('pending' or 'completed')
 *     - transaction_id: number - ID of the created transaction if status is 'completed'
 *     - transaction_type_id: number - ID of the transaction type
 *   - 404: Error object if schedule not found
 *   - 500: Error object if validation or database error occurs
 */
export async function GET(request: NextRequest) {
  try {
    // Get scheduleId from query params and validate
    const scheduleId = await z
      .string()
      .parseAsync(request.nextUrl.searchParams.get("scheduleId"));

    // Query schedule transactions joined with schedule details
    const scheduleTransactionList = await sql`
      select 
        st.id as id,
        s.amount as amount,
        to_char(st.date, 'YYYY-MM-DD') as date, -- Format date as YYYY-MM-DD
        st.status as status, -- pending or completed
        st.transaction_id as transaction_id,
        s.transaction_type_id as transaction_type_id
      from schedule_transaction st
      left join schedule s on st.schedule_id = s.id
      where st.schedule_id = ${scheduleId}
      order by st.date desc
    `;

    // Return 404 if no transactions found
    if (scheduleTransactionList.length === 0) {
      return Response.json({ message: "schedule not found" }, { status: 404 });
    }

    // Return list of schedule transactions
    return Response.json(scheduleTransactionList);
  } catch (error) {
    // Log and return any errors
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
