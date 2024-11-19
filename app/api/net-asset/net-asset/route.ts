import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const propertyQuery = await sql`
      select sum(balance)
      from (
        select na.account_id,
            (
                a.amount -- initial
                -
                COALESCE (
                  (
                    SELECT SUM(t.amount) 
                    FROM transaction t 
                    LEFT JOIN expense e 
                    ON e.transaction_id = t.id
                    WHERE t.transaction_type_id = 1 AND e.account_id = a.id
                  ),0
                ) -- expense
                +
                COALESCE (
                  (
                    SELECT SUM(t.amount) 
                    FROM transaction t 
                      LEFT JOIN income i 
                    ON i.transaction_id = t.id
                    WHERE t.transaction_type_id = 2	AND i.account_id = a.id		
                  ),0
                ) -- income
                -
                COALESCE (
                  (
                    SELECT SUM(t.amount) 
                    FROM transaction t 
                    LEFT JOIN transfer tf
                    ON tf.transaction_id = t.id
                    WHERE t.transaction_type_id = 3 AND tf.account_id_from = a.id 
                  ),0
                ) -- transfer out
                +
                COALESCE (
                  (
                    SELECT SUM(t.amount) 
                    FROM transaction t 
                    LEFT JOIN transfer tf
                    ON tf.transaction_id = t.id
                    WHERE t.transaction_type_id = 3 AND tf.account_id_to = a.id 
                  ),0
                ) -- transfer IN
                -
                COALESCE (
                  (
                    SELECT SUM(t.amount) 
                    FROM transaction t 
                    LEFT JOIN debt d
                    ON d.transaction_id = t.id
                    WHERE t.transaction_type_id = 4 AND d.account_id_from = a.id 
                  ),0
                ) -- debt out
                +
                COALESCE (
                  (
                    SELECT SUM(t.amount) 
                    FROM transaction t 
                    LEFT JOIN debt d
                    ON d.transaction_id = t.id
                    WHERE t.transaction_type_id = 4 AND d.account_id_to = a.id 
                  ),0
                ) -- debt in
              ) AS balance
        from net_asset na
        left join account a on a.id = na.account_id 
        where na.type = 2
      ) as net_asset
    `;

    const debtQuery = await sql`
    select sum(balance) 
    from (
      select na.account_id,
          (
              a.amount -- initial
              -
              COALESCE (
                (
                  SELECT SUM(t.amount) 
                  FROM transaction t 
                  LEFT JOIN expense e 
                  ON e.transaction_id = t.id
                  WHERE t.transaction_type_id = 1 AND e.account_id = a.id
                ),0
              ) -- expense
              +
              COALESCE (
                (
                  SELECT SUM(t.amount) 
                  FROM transaction t 
                    LEFT JOIN income i 
                  ON i.transaction_id = t.id
                  WHERE t.transaction_type_id = 2	AND i.account_id = a.id		
                ),0
              ) -- income
              -
              COALESCE (
                (
                  SELECT SUM(t.amount) 
                  FROM transaction t 
                  LEFT JOIN transfer tf
                  ON tf.transaction_id = t.id
                  WHERE t.transaction_type_id = 3 AND tf.account_id_from = a.id 
                ),0
              ) -- transfer out
              +
              COALESCE (
                (
                  SELECT SUM(t.amount) 
                  FROM transaction t 
                  LEFT JOIN transfer tf
                  ON tf.transaction_id = t.id
                  WHERE t.transaction_type_id = 3 AND tf.account_id_to = a.id 
                ),0
              ) -- transfer IN
              -
              COALESCE (
                (
                  SELECT SUM(t.amount) 
                  FROM transaction t 
                  LEFT JOIN debt d
                  ON d.transaction_id = t.id
                  WHERE t.transaction_type_id = 4 AND d.account_id_from = a.id 
                ),0
              ) -- debt out
              +
              COALESCE (
                (
                  SELECT SUM(t.amount) 
                  FROM transaction t 
                  LEFT JOIN debt d
                  ON d.transaction_id = t.id
                  WHERE t.transaction_type_id = 4 AND d.account_id_to = a.id 
                ),0
              ) -- debt in
            ) AS balance
      from net_asset na
      left join account a on a.id = na.account_id 
      where na.type = 1
    ) as net_asset
  `;

    const property = propertyQuery[0].sum ?? "0.00";
    const debt = debtQuery[0].sum ?? "0.00";

    return Response.json({
      property: property,
      debt: debt,
      total: (Number(property) + Number(debt)).toFixed(2),
    });
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
