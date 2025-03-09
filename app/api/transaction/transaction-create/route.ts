import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const schema = z.object({
      amount: z.number(),
      note: z.string().optional(),
      transactionTypeId: z.number(),
      categoryId: z.number().nullable(),
      accountIdFrom: z.number(),
      accountIdTo: z.number().nullable(),
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
            category_id,
            account_id_from,
            account_id_to,
            updated_at
        )
        VALUES(
            ${body.amount},
            ${body.note ?? ""},
            ${body.transactionTypeId},
            ${body.categoryId},
            ${body.accountIdFrom},
            ${body.accountIdTo},
            ${date}
        )
        RETURNING id
    `;

    return Response.json({ createTransaction: createTransaction[0] });
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
