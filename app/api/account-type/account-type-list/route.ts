import { NextRequest } from "next/server";
import sql from "@/config/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const accountTypeList = await sql`
      select * from account_type
      order by id
    `;

    return Response.json(accountTypeList);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
