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
      accountId: z.number(),
      categoryId: z.number(),
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
            updated_at
        )
        VALUES(
            ${body.amount},
            ${body.note ?? ""},
            ${body.transactionTypeId},
            ${body.categoryId},
            ${date}
        )
        RETURNING id
    `;

    // expense
    if (body.transactionTypeId === 1) {
      await sql`
        INSERT INTO expense(
            transaction_id,
            account_id,
            created_at,
            updated_at
        )
        VALUES(
            ${createTransaction[0].id},
            ${body.accountId},
            ${date},
            ${date}
        )
      `;
    }

    // income
    if (body.transactionTypeId === 2) {
      await sql`
        INSERT INTO income(
            transaction_id,
            account_id,
            created_at,
            updated_at
        )
        VALUES(
            ${createTransaction[0].id},
            ${body.accountId},
            ${date},
            ${date}
        )
      `;
    }

    return Response.json({ createTransaction });
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
