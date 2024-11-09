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
    });

    const body = await schema.parseAsync(await req.json());

    const date = new Date(`${body.date} ${body.time}`);

    const updateTransfer = await sql`
        UPDATE "transaction"
        SET
          amount=${body.amount},
          note=${body.note ?? ""},
          updated_at=${date}
        WHERE
          id=${body.transactionId}
        RETURNING *
    `;

    if (updateTransfer.length > 0) {
      await sql`
        UPDATE transfer
        SET
          account_id_from=${body.accountIdFrom},
          account_id_to=${body.accountIdTo},
          updated_at=${date}
        WHERE
          transaction_id=${body.transactionId}
        RETURNING *
      `;
    }

    return Response.json(updateTransfer[0]);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
