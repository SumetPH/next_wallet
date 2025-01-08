import sql from "@/config/db";
import { NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await schema.parseAsync(await request.json());

    // check if user exists in the database
    const userExists = await sql`
        SELECT * FROM users WHERE email = ${body.email} AND password = ${body.password}
    `;
    if (userExists.length === 0) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // check password
    if (userExists[0].password !== body.password) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // generate token
    const token = "tokenjfksjfksjfjfksjfksfkjfksf";

    // send response with token
    return Response.json(
      { message: "Login successful", token },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
