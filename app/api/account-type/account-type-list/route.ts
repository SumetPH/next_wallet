import { NextRequest } from "next/server";
import sql from "@/config/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const accountTypeList = await sql`
      SELECT * FROM account_type
    `;

    return Response.json(accountTypeList);
  } catch (error) {
    return Response.json(error, { status: 500 });
  }
}
