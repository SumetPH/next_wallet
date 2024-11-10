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
      date: z.string(),
      time: z.string(),
      accountIdFrom: z.number(),
      accountIdTo: z.number(),
      categoryId: z.number().optional(),
    });

    const body = await schema.parseAsync(await req.json());

    const date = new Date(`${body.date} ${body.time}`);

    const updateDebt = await sql`
        UPDATE "transaction"
        SET
          amount=${body.amount},
          note=${body.note ?? ""},
          updated_at=${date},
          category_id=${body.categoryId ?? null}
        WHERE
          id=${body.transactionId}
        RETURNING *
    `;

    if (updateDebt.length > 0) {
      await sql`
        UPDATE debt
        SET
          account_id_from=${body.accountIdFrom},
          account_id_to=${body.accountIdTo},
          updated_at=${date}
        WHERE
          transaction_id=${body.transactionId}
        RETURNING *
      `;
    }

    return Response.json(updateDebt[0]);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
