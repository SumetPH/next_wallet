import { NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  token: z.string(),
});

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const body = await schema.parseAsync(await request.json());

    // FIXME decode token
    if (body.token !== "tokenjfksjfksjfjfksjfksfkjfksf") {
      return Response.json({ message: "Invalid token" }, { status: 401 });
    }

    // TODO get user
    const user = {};

    // send response
    return Response.json(user, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
