import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  try {
    const accountId = await z
      .string()
      .parseAsync(req.nextUrl.searchParams.get("accountId") || null);

    const msg = await sql.begin(async (sql) => {
      await sql`
        DELETE FROM transaction WHERE id IN (SELECT transaction_id FROM expense WHERE account_id = ${accountId})
      `;
      await sql`
        DELETE FROM transaction WHERE id IN (SELECT transaction_id FROM income WHERE account_id = ${accountId})
      `;
      await sql`
        DELETE FROM transaction WHERE id IN (SELECT transaction_id FROM transfer WHERE account_id_from = ${accountId} OR account_id_to = ${accountId})
      `;
      await sql`
        DELETE FROM transaction WHERE id IN (SELECT transaction_id FROM debt WHERE account_id_from = ${accountId} OR account_id_to = ${accountId})
      `;

      await sql`
        DELETE FROM expense WHERE account_id = ${accountId}
      `;
      await sql`
        DELETE FROM income WHERE account_id = ${accountId}
      `;
      await sql`
        DELETE FROM transfer WHERE account_id_from = ${accountId} OR account_id_to = ${accountId}
      `;
      await sql`
        DELETE FROM debt WHERE account_id_from = ${accountId} OR account_id_to = ${accountId}
      `;
      await sql`
        DELETE FROM account WHERE id = ${accountId}
      `;
      await sql`
        DELETE FROM account_credit WHERE account_id = ${accountId}
      `;
      return "deleted";
    });

    return Response.json(msg);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
