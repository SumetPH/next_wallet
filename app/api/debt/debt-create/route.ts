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
      categoryId: z.number().optional(),
    });

    const body = await schema.parseAsync(await req.json());

    const date = new Date(`${body.date} ${body.time}`);

    const createTransaction = await sql<{ id: number }[]>`
        INSERT INTO transaction(
          amount,
          note,
          transaction_type_id,
          created_at,
          updated_at,
          category_id
        )
        VALUES(
          ${body.amount},
          ${body.note ?? ""},
          ${4},
          ${date},
          ${date},
          ${body.categoryId ?? null}
        )
        RETURNING id
    `;

    const createDebt = await sql`
        INSERT INTO debt(
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

    return Response.json({
      createTransaction: createTransaction[0],
      createDebt: createDebt[0],
    });
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
