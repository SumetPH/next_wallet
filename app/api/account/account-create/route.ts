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
    });

    const body = await schema.parseAsync(await req.json());

    const createAccount = await sql`
      INSERT INTO account
        (name, amount, account_type_id)
      VALUES
        (${body.name}, ${body.amount}, ${body.accountTypeId})
      RETURNING *
    `;

    return Response.json(createAccount[0]);
  } catch (error) {
    return Response.json(error, { status: 500 });
  }
}
