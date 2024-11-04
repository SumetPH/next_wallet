import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const schema = z.object({
      amount: z.number(),
      note: z.string().optional(),
      accountId: z.number(),
      categoryId: z.number(),
    });

    const body = await schema.parseAsync(await req.json());

    const createTransaction = await sql<{ id: number }[]>`
        INSERT INTO transaction(
            amount,
            note,
            transaction_type_id,
            category_id,
            created_at,
            updated_at
        )
        VALUES(
            ${body.amount},
            ${body.note ?? ""},
            ${2},
            ${body.categoryId},
            ${new Date()},
            ${new Date()}
        )
        RETURNING id
    `;

    const createIncome = await sql`
        INSERT INTO income(
            transaction_id,
            account_id,
            created_at,
            updated_at
        )
        VALUES(
            ${createTransaction[0].id},
            ${body.accountId},
            ${new Date()},
            ${new Date()}
        )
        RETURNING *
    `;

    return Response.json({ createTransaction, createIncome });
  } catch (error) {
    return Response.json(error, { status: 500 });
  }
}
