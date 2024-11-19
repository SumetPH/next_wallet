import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const accounts = z.object({
      account_id: z.number(),
      account_name: z.string(),
      status: z.boolean(),
    });

    const schema = z.object({
      property_list: z.array(accounts),
      debt_list: z.array(accounts),
    });

    const body = await schema.parseAsync(await req.json());

    // delete net asset
    for (const account of body.property_list) {
      await sql`
        delete from net_asset
        where account_id = ${account.account_id}
      `;
    }
    // insert property
    for (const account of body.property_list.filter(
      (account) => account.status
    )) {
      await sql`
        insert into net_asset (account_id, type)
        values (${account.account_id}, 2)
      `;
    }
    // insert debt
    for (const account of body.debt_list.filter((account) => account.status)) {
      await sql`
        insert into net_asset (account_id, type)
        values (${account.account_id}, 1)
      `;
    }

    return Response.json("net asset updateds");
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
