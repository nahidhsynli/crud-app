const express = require('express');
const client = require('./database');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', async function (req, res) {
  const { page = '1', limit = '100' } = req.query;
  const offset = (page - 1) * limit;

  const countResult = await client.query('SELECT COUNT(id) FROM users;');
  const numberOfPages = Math.ceil(countResult.rows[0].count / limit);

  const usersResult = await client.query(
    `SELECT username, bio, phone, email, status 
     FROM users 
     LIMIT $1 OFFSET $2;`,
    [limit, offset]
  );

  res.render('home', {
    users: usersResult.rows,
    numberOfPages,
  });
});

app.listen(8080, function () {
  console.log('🚀 Express app is running on port 8080!');
});
