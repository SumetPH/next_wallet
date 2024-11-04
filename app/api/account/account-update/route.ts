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
    });

    const body = await schema.parseAsync(await req.json());

    const updateAccount = await sql`
      UPDATE account 
      SET name=${body.name}, amount=${body.amount}, account_type_id=${
      body.accountTypeId
    }, updated_at=${new Date()} WHERE id=${body.accountId}
      RETURNING *
    `;

    return Response.json(updateAccount[0]);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
