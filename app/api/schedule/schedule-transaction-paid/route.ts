import sql from "@/config/db";
import { NextRequest } from "next/server";
import { z } from "zod";

export async function PUT(request: NextRequest) {
  try {
    const bodySchema = z.object({
      scheduleId: z.number(),
      transactionId: z.number(),
    });

    const body = await bodySchema.parseAsync(await request.json());

    const paid = await sql`
      update schedule_transaction
      set 
        transaction_id=${body.transactionId}, 
        status='paid',
        updated_at=${new Date()}
      where id=${body.scheduleId}
      returning *
    `;

    return Response.json(paid[0], { status: 200 });
  } catch (error) {
    // Log and return any errors
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
