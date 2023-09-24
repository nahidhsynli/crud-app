const pg = require("pg");

const client = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "users",
  password: "postgresql",
  port: 5432,
});
  
client
  .connect()
  .then(function () {
    console.log("✅ Connected to database successfully!");
  })
  .catch(function (error) {
    console.log("❌ Error connecting to database! " + error.message);
  });

module.exports = client;
