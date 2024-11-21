import sql from "@/config/db";
import { z } from "zod";

/**
 * API endpoint to get list of all schedules with their current month's transaction status
 *
 * @param request - HTTP request object (not used but required by Next.js API routes)
 *
 * @returns Response with:
 *   - 200: Array of schedule objects containing:
 *     - id: number - Schedule ID
 *     - name: string - Schedule name
 *     - start_date: string - Start date in YYYY-MM-DD format
 *     - end_date: string - End date in YYYY-MM-DD format
 *     - amount: number - Amount for each scheduled transaction
 *     - transaction_type_id: number - ID of the transaction type
 *     - transaction_type_name: string - Name of the transaction type
 *     - status: string - Current month's transaction status ('pending' or 'completed')
 *     - transaction_id: number - ID of the created transaction if status is 'completed'
 *     - schedule_transaction_date: string - Date of current month's scheduled transaction
 *   - 500: Error object if database error occurs
 */
export async function GET(request: Request) {
  try {
    // Query schedules joined with transaction types and current month's schedule transactions
    const scheduleList = await sql`
      select 
        s.id as id,
        s.name as name,
        to_char(s.start_date, 'YYYY-MM-DD') as start_date, -- Format dates as YYYY-MM-DD
        to_char(s.end_date, 'YYYY-MM-DD') as end_date,
        s.amount as amount,
        s.transaction_type_id as transaction_type_id,
        t.name as transaction_type_name,
        st.status as status, -- pending or completed
        st.transaction_id as transaction_id,
        to_char(st.date, 'YYYY-MM-DD') as schedule_transaction_date
      from schedule s
      left join transaction_type t on s.transaction_type_id = t.id
      -- Join with schedule_transaction only for current month's transactions
      left join schedule_transaction st on s.id = st.schedule_id 
      and current_date between st.date and st.date + interval '1 month' - interval '1 day'
    `;

    // Return list of schedules
    return Response.json(scheduleList);
  } catch (error) {
    // Log and return any errors
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
