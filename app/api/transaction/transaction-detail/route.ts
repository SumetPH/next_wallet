import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const transactionId = await z
      .string()
      .parseAsync(req.nextUrl.searchParams.get("transactionId") || null);

    const detail = await sql`
      select 
        t.*,
        tt.name as transaction_type_name,
        c.name as category_name,
        af.name as account_id_from_name,
        at.name as account_id_to_name,
        to_char(t.updated_at, 'YYYY-MM-DD') as date,
        to_char(t.updated_at, 'HH24:MI:SS') as time
      from transaction t
      left join transaction_type tt on tt.id = t.transaction_type_id
      left join category c on c.id = t.category_id
      left join account af on af.id = t.account_id_from
      left join account at on at.id = t.account_id_to
      where t.id = ${transactionId}
      limit 1
    `;

    return Response.json(detail[0]);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
