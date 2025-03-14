import { NextRequest } from "next/server";
import sql from "@/config/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await sql.begin(async (sql) => {
      await sql`
        CREATE TABLE IF NOT EXISTS account(
          id SERIAL PRIMARY KEY,
          name TEXT,
          amount NUMERIC(10, 2),
          account_type_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          order_index INTEGER,
          icon_path TEXT
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS account_type(
          id SERIAL PRIMARY KEY, 
          name TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const accountTypeList = await sql`select * from account_type`;
      if (accountTypeList.length === 0) {
        await sql`
          INSERT INTO 
            account_type(id, name) 
          VALUES
            (1, 'เงินสด'),
            (2, 'ธนาคาร'),
            (3, 'บัตรเครดิต'),
            (4, 'หนี้สิน')
        `;
      }

      await sql`
        CREATE TABLE IF NOT EXISTS category(
          id SERIAL PRIMARY KEY,
          name Text,
          category_type_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          order_index INTEGER
        )
      `;

      const categoryList = await sql`select * from category`;
      if (categoryList.length === 0) {
        await sql`
          INSERT INTO
            category(name, category_type_id)
            VALUES
            ('อาหาร', 1),
            ('ใช้จ่าย', 1),
            ('อื่นๆ', 1),
            ('เงินเดือน', 2),
            ('ใช้คืน', 2),
            ('อื่นๆ', 2)
        `;
      }

      await sql`
        CREATE TABLE IF NOT EXISTS category_type(
          id SERIAL PRIMARY KEY, 
          name TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const categoryTypeList = await sql`select * from category_type`;
      if (categoryTypeList.length === 0) {
        await sql`
          INSERT INTO 
            category_type(id, name) 
          VALUES
            (1, 'รายจ่าย'),
            (2, 'รายรับ')
      `;
      }

      await sql`
        CREATE TABLE IF NOT EXISTS transaction(
          id SERIAL PRIMARY KEY,  
          amount NUMERIC(10, 2),
          note TEXT,
          transaction_type_id INTEGER,
          category_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS transaction_type(
          id SERIAL PRIMARY KEY,  
          name TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const transactionTypeList = await sql`select * from transaction_type`;
      if (transactionTypeList.length === 0) {
        await sql`
          INSERT INTO 
            transaction_type(id, name) 
          VALUES
            (1, 'รายจ่าย'),
            (2, 'รายรับ'),
            (3, 'โอน'),
            (4, 'ชำระหนี้')
        `;
      }

      await sql`
        CREATE TABLE IF NOT EXISTS expense(
          id SERIAL PRIMARY KEY,  
          transaction_id INTEGER DEFAULT 1,
          account_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS income(
          id SERIAL PRIMARY KEY,  
          transaction_id INTEGER DEFAULT 2,
          account_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS transfer(
          id SERIAL PRIMARY KEY,  
          transaction_id INTEGER DEFAULT 3,
          account_id_from INTEGER,
          account_id_to INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS debt(
          id SERIAL PRIMARY KEY,  
          transaction_id INTEGER DEFAULT 4,
          account_id_from INTEGER,
          account_id_to INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        create table if not exists budget(
          id serial primary key,
          name text,
          amount numeric(10, 2),
          start_date integer,
          created_at timestamp default current_timestamp,
          updated_at timestamp default current_timestamp,
          order_index integer
        )
      `;

      await sql`
        create table if not exists budget_category(
          id serial primary key,
          budget_id integer,
          category_id integer,
          created_at timestamp default current_timestamp,
          updated_at timestamp default current_timestamp
        )
      `;

      await sql`
        create table if not exists account_credit(
          id serial primary key,
          account_id integer,
          credit_start_date integer,
          created_at timestamp default current_timestamp,
          updated_at timestamp default current_timestamp
        )
      `;

      await sql`
        create table if not exists net_asset(
          id serial primary key,
          account_id integer,
          type integer, -- 1 = ทรัพย์สิน, 2 = หนี้สิน
          created_at timestamp default current_timestamp,
          updated_at timestamp default current_timestamp 
        )
      `;

      await sql`
        create table if not exists schedule(
          id serial primary key,
          name text,
          start_date timestamp,
          end_date timestamp,
          order_index integer,
          created_at timestamp default current_timestamp,
          updated_at timestamp default current_timestamp
        )
      `;

      await sql`
        create table if not exists schedule_transaction(
          id serial primary key,
          schedule_id integer,
          amount numeric(10, 2),
          transaction_type_id integer,
          transaction_id integer,
          status text default 'pending', -- pending, completed
          date timestamp,
          created_at timestamp default current_timestamp,
          updated_at timestamp default current_timestamp
        )
      `;

      await sql`
        create table if not exists schedule_template_debt (
          id serial4 not null primary key,
          account_id_from int4 null,
          account_id_to int4 null,
          schedule_id int4 null
        );
      `;

      await sql`
        create table if not exists schedule_template_expense (
          id serial4 not null primary key,
          schedule_id int4 null,
          account_id int4 null
        );
      `;

      return "success";
    });

    return Response.json("initial database");
  } catch (error) {
    console.error(error);
    return Response.json(error, { status: 500 });
  }
}
