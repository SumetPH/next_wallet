import sql from "@/config/db";
import { NextRequest } from "next/server";
import { z } from "zod";

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
        (
          case
            when st.status = 'pending' then 'ยังไม่จ่าย'
            else 'จ่ายแล้ว'
          end
        ) as status, -- pending or completed
        st.transaction_id as transaction_id,
        s.transaction_type_id as transaction_type_id,
        ste.account_id as expense_account_id,
        aste.name as expense_account_name,
        std.account_id_from as debt_account_id_from,
        astdf.name as debt_account_name_from,
        std.account_id_to as debt_account_id_to,
        astdt.name as debt_account_name_to
      from schedule_transaction st
      left join schedule s on st.schedule_id = s.id
      left join schedule_template_expense ste on ste.schedule_id = s.id
      left join account aste on aste.id = ste.account_id
      left join schedule_template_debt std on std.schedule_id = s.id
      left join account astdf on astdf.id = std.account_id_from
      left join account astdt on astdt.id = std.account_id_to
      where st.schedule_id = ${scheduleId}
      order by st.date asc
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
