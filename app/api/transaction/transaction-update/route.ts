import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const schema = z.object({
      transactionId: z.number(),
      amount: z.number(),
      note: z.string().optional(),
      categoryId: z.number().nullable(),
      accountIdFrom: z.number(),
      accountIdTo: z.number().nullable(),
      date: z.string(),
      time: z.string(),
    });

    const body = await schema.parseAsync(await req.json());

    const date = new Date(`${body.date} ${body.time}`);

    const updateTransaction = await sql`
        UPDATE "transaction"
        SET
          amount=${body.amount},
          note=${body.note ?? ""},
          category_id=${body.categoryId},
          account_id_from=${body.accountIdFrom},
          account_id_to=${body.accountIdTo},
          updated_at=${date}
        WHERE
          id=${body.transactionId}
        RETURNING *
    `;

    return Response.json(updateTransaction[0]);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
