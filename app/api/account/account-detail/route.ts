import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const accountId = await z
      .string()
      .parseAsync(req.nextUrl.searchParams.get("accountId") || null);

    const accountDetail = await sql`
     SELECT * FROM account WHERE id=${accountId} limit 1
    `;

    if (accountDetail.length === 0) {
      return Response.json({ message: "account not found" }, { status: 404 });
    }

    return Response.json(accountDetail[0]);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
