import sql from "@/config/db";
import { NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  email: z.string().email(),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // validate request
    const body = await schema.parseAsync(await req.json());

    const createUser = await sql`
      INSERT INTO users (username, password, email)
      VALUES (${body.username}, ${body.password}, ${body.email})
      RETURNING *
    `;

    return Response.json(createUser[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
