import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const schema = z.object({
      transactionId: z.number(),
      amount: z.number(),
      note: z.string().optional(),
      accountId: z.number(),
      categoryId: z.number(),
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
          updated_at=${date}
        WHERE
          id=${body.transactionId}
        RETURNING *
    `;

    if (updateTransaction.length > 0) {
      if (updateTransaction[0].transaction_type_id === 1) {
        await sql`
          UPDATE expense
          SET
            account_id=${body.accountId},
            updated_at=${date}
          WHERE
            transaction_id=${body.transactionId}
          RETURNING *
        `;
      }
      if (updateTransaction[0].transaction_type_id === 2) {
        await sql`
          UPDATE income
          SET
            account_id=${body.accountId},
            updated_at=${date}
          WHERE
            transaction_id=${body.transactionId}
          RETURNING *
        `;
      }
    }

    return Response.json(updateTransaction[0]);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
