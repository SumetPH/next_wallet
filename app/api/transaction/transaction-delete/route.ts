import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  try {
    const transactionId = await z
      .string()
      .parseAsync(req.nextUrl.searchParams.get("transactionId") || null);

    const transaction = await sql`
        SELECT *
        FROM "transaction"
        WHERE
          id=${transactionId}
    `;

    if (transaction.length > 0) {
      // delete expense
      if (transaction[0].transaction_type_id === 1) {
        await sql`
          DELETE FROM expense
          WHERE
            transaction_id=${transactionId}
          RETURNING *
        `;
      }

      // delete income
      if (transaction[0].transaction_type_id === 2) {
        await sql`
          DELETE FROM income
          WHERE
            transaction_id=${transactionId}
          RETURNING *
        `;
      }

      const deleteTransaction = await sql`
        DELETE FROM "transaction"
        WHERE
          id=${transactionId}
        RETURNING *
      `;

      return Response.json(deleteTransaction[0]);
    } else {
      return Response.json("not found transaction", { status: 404 });
    }
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
