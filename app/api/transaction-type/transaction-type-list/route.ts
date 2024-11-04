import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const transactionTypeList = await sql`
      SELECT * FROM transaction_type
    `;

    return Response.json(transactionTypeList);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
