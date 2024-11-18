import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const schema = z.object({
      name: z.string(),
      amount: z.number(),
      accountTypeId: z.number(),
      iconPath: z.string().nullable().optional(),
      creditStartDate: z.number().nullable().optional(),
    });

    const body = await schema.parseAsync(await req.json());

    const createAccount = await sql`
      INSERT INTO account
        (name, amount, account_type_id, icon_path)
      VALUES
        (
          ${body.name},
          ${body.amount},
          ${body.accountTypeId},
          ${body.iconPath ?? null}
        )
      RETURNING *
    `;

    // if account type is credit create account credit
    if (body.accountTypeId === 3) {
      await sql`
        insert into account_credit
          (
            account_id,
            credit_start_date,
            created_at,
            updated_at
          )
        values
          (
            ${createAccount[0].id},
            ${body.creditStartDate ?? null},
            ${new Date()},
            ${new Date()}
          )
      `;
    }

    return Response.json(createAccount[0]);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
