import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const propertyQuery = await sql`
      select 
        a.*,
        (
          a.amount -- initial
          +
          COALESCE (
            (
              SELECT SUM(t.amount) 
              FROM transaction t 
              WHERE t.account_id_to = a.id
            ),0
          )
          -
          COALESCE (
            (
              SELECT SUM(t.amount) 
              FROM transaction t 
              WHERE t.account_id_from = a.id
            ),0
          )
        ) as balance
      from net_asset na
      left join account a on a.id = na.account_id
      where na.type = 1
    `

    const debtQuery = await sql`
    select 
      a.*,
      (
        a.amount -- initial
        +
        COALESCE (
          (
            SELECT SUM(t.amount) 
            FROM transaction t 
            WHERE t.account_id_to = a.id
          ),0
        )
        -
        COALESCE (
          (
            SELECT SUM(t.amount) 
            FROM transaction t 
            WHERE t.account_id_from = a.id
          ),0
        )
      ) as balance
    from net_asset na
    left join account a on a.id = na.account_id
    where na.type = 2
    `
    

    const property = propertyQuery.reduce((acc, curr) => {
      return acc + Number(curr.balance);
    }, 0);
    const debt = debtQuery.reduce((acc, curr) => {
      return acc + Number(curr.balance);
    }, 0);

    return Response.json({
      property: property.toFixed(2),
      debt: debt.toFixed(2),
      total: (property + debt).toFixed(2),
    });
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
