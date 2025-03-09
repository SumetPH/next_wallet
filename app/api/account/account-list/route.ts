import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const schema = z.object({
      type: z.array(z.number()).optional(),
    });

    const body = await schema.parseAsync(await req.json());

    const accountTypeList = await sql`
      SELECT * FROM account_type at
     ${body.type ? sql`where at.id in ${sql(body.type)}` : sql``}
      order by at.id
    `;

    for (const accountType of accountTypeList) {
      const accountList = await sql`
        SELECT 
          a.*,
          COALESCE(SUM(
              CASE 
                  WHEN t.account_id_to = a.id THEN t.amount  -- รายรับ & เงินเข้า
                  WHEN t.account_id_from = a.id THEN -t.amount  -- รายจ่าย & เงินออก
                  ELSE 0 
              END
          ), 0) + a.amount AS balance
        FROM account a
        LEFT JOIN transaction t 
          ON a.id = t.account_id_to OR a.id = t.account_id_from
        WHERE a.account_type_id = ${accountType.id} and a.is_hidden = false
        GROUP BY a.id, a.name
        ORDER BY a.order_index, a.name;
      `;

      const total = accountList.reduce((p, c) => p + Number(c.balance), 0);

      accountType.total = total.toFixed(2);
      accountType.accountList = accountList;
    }

    return Response.json(accountTypeList);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
