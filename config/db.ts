import postgres from "postgres";

const sql = postgres({
  host: "localhost",
  username: "sumetph",
  password: "sumet",
  database: "flutter_wallet",
  port: 5432,
});

// const sql = postgres({
//   host: "ep-lucky-base-56244334-pooler.ap-southeast-1.aws.neon.tech",
//   username: "default",
//   password: "uThym10vDgzF",
//   database: "verceldb",
//   port: 5432,
//   ssl: true,
// });

export default sql;
