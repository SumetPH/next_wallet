import postgres from "postgres";

const sql = postgres({
  host: "localhost",
  username: "sumetph",
  password: "sumet",
  database: "flutter_wallet",
  port: 5432,
});

export default sql;
