import { NextRequest } from "next/server";
import sql from "@/config/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const categoryTypeId = req.nextUrl.searchParams.get("categoryTypeId");

    const categoryList = await sql`
      select 
        c.id as id,
        c.name as name,
        c.category_type_id as category_type_id,
        ct.name as category_type_name,
        coalesce(sum(t.amount),0.00) as amount,
        c.created_at as created_at,
        c.updated_at as updated_at
      from category c
      left join
        category_type ct
      on ct.id = c.category_type_id
      left join 
        transaction t
      on t.category_id = c.id 
       ${
         categoryTypeId
           ? sql`WHERE c.category_type_id = ${categoryTypeId}`
           : sql``
       }
       group by c.id, c.category_type_id, ct.name
      order by c.name
    `;

    return Response.json(categoryList);
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
