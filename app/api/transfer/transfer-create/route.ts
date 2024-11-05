import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const schema = z.object({
      amount: z.number(),
      note: z.string().optional(),
      accountIdFrom: z.number(),
      accountIdTo: z.number(),
      date: z.string(),
      time: z.string(),
    });

    const body = await schema.parseAsync(await req.json());

    const date = new Date(`${body.date} ${body.time}`);

    const createTransaction = await sql<{ id: number }[]>`
        INSERT INTO transaction(
          amount,
          note,
          transaction_type_id,
          created_at,
          updated_at
        )
        VALUES(
          ${body.amount},
          ${body.note ?? ""},
          ${3},
          ${date},
          ${date}
        )
        RETURNING id
    `;

    const createTransfer = await sql`
        INSERT INTO transfer(
          transaction_id,
          account_id_from,
          account_id_to,
          created_at,
          updated_at
        )
        VALUES(
            ${createTransaction[0].id},
            ${body.accountIdFrom},
            ${body.accountIdTo},
            ${date},
            ${date}
        )
        RETURNING *
    `;

    return Response.json({ createTransaction, createTransfer });
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
