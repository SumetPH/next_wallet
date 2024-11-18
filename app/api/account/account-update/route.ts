import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const schema = z.object({
      accountId: z.number(),
      name: z.string(),
      amount: z.number(),
      accountTypeId: z.number(),
      iconPath: z.string().nullable().optional(),
      creditStartDate: z.number().nullable().optional(),
    });

    const body = await schema.parseAsync(await req.json());

    const updateAccount = await sql`
      UPDATE account 
      SET 
        name=${body.name},
        amount=${body.amount}, 
        account_type_id=${body.accountTypeId}, 
        icon_path=${body.iconPath ?? null},
        updated_at=${new Date()} 
      WHERE id=${body.accountId}
      RETURNING *
    `;

    // if account type is credit update account credit
    if (body.accountTypeId === 3 && body.creditStartDate) {
      await sql`
        update account_credit
        set 
          credit_start_date=${body.creditStartDate},
          updated_at=${new Date()}
        where account_id=${body.accountId}
      `;
    }

    return Response.json(updateAccount[0]);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
