import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const accounts = z.object({
      accountId: z.number(),
      type: z.number(),
    });

    const schema = z.object({
      accounts: z.array(accounts),
    });

    const body = await schema.parseAsync(await req.json());

    for (const account of body.accounts) {
      await sql`
        insert into net_asset (account_id, type, created_at, updated_at)
        values (
          ${account.accountId},
          ${account.type},
          ${new Date()}, 
          ${new Date()}
        )
      `;
    }

    return Response.json("created net asset");
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
