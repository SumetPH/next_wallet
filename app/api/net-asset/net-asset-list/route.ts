import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const propertyList = await sql`
      select 
        a.id as account_id,
        a.name as account_name,
        (
          case
            when na.type = 2 then
              true
            else
              false
          end
        ) as status
      from account a
      left join net_asset na
      on na.account_id = a.id
      where a.account_type_id = 1 or a.account_type_id = 2
      order by a.account_type_id, a.order_index
    `;

    const debtList = await sql`
    select 
      a.id as account_id,
      a.name as account_name,
      (
        case
          when na.type = 1 then
            true
          else
            false
        end
      ) as status
    from account a
    left join net_asset na
    on na.account_id = a.id
    where a.account_type_id = 3 or a.account_type_id = 4
    order by a.account_type_id, a.order_index
  `;

    return Response.json({ property_list: propertyList, debt_list: debtList });
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
