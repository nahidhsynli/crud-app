const express = require("express");
const client = require("./database");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

async function addUser(newUser) {
  try {
    const { user_name, user_phone, user_gender, user_job } = newUser;
    const query = `
      INSERT INTO users (user_name, user_phone, user_gender, user_job)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [user_name, user_phone, user_gender, user_job];
    const result = await client.query(query, values);

    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

app.get("/", async function (req, res) {
  const { page = "1", limit = "10" } = req.query;
  const offset = (page - 1) * limit;

  const countResult = await client.query("SELECT COUNT(user_id) FROM users;");
  const numberOfPages = Math.ceil(countResult.rows[0].count / limit);

  const usersResult = await client.query(
    `SELECT user_id,user_name,user_phone,user_gender,user_job 
     FROM users 
     LIMIT $1 OFFSET $2;`,
    [limit, offset]
  );

  res.render("home", {
    users: usersResult.rows,
    numberOfPages,
  });
});

app.get("/addUserForm", (req, res) => {
  res.render("add");
});

app.post("/addUser", async (req, res) => {
  const newUser = req.body;

  try {
    const addedUser = await addUser(newUser);
    res.redirect("/");
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).send("Error adding user: " + error.message);
  }
});

app.get("/deleteUser/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);

  client.query(
    "DELETE FROM users WHERE user_id = $1",
    [userId],
    (err, result) => {
      if (err) {
        console.error("Error deleting user:", err);
        res.status(500).send("Error deleting user");
      } else {
        console.log("User deleted successfully");
        res.redirect("/");
      }
    }
  );
});

app.get("/updateUser/:userId", (req, res) => {
  const userId = req.params.userId;
  const query = "SELECT * FROM users WHERE user_id = $1";

  client.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching user for update:", err);
      return res.status(404).send("User not found");
    }

    const userToUpdate = result.rows[0];

    res.render("update", { userId: userId, user: userToUpdate });
  });
});

app.post("/updateUser/:userId", (req, res) => {
  const userId = req.params.userId;
  const { user_name, user_phone, user_gender, user_job } = req.body;

  const query =
    "UPDATE users SET user_name = $1, user_phone = $2, user_gender = $3, user_job = $4 WHERE user_id = $5";

  client.query(
    query,
    [user_name, user_phone, user_gender, user_job, userId],
    (err, result) => {
      if (err) {
        console.error("Error updating user:", err);
        res.status(500).send("Error updating user: " + err.message);
      } else {
        res.redirect("/");
      }
    }
  );
});

app.listen(8080, function () {
  console.log("🚀 Express app is running on port 8080!");
});
