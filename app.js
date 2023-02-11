const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");

const dbPath = path.join(__dirname, "userData.db");
let db = null;

const app = express();

const initializeServerAndDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
  app.listen(3007, () => {
    console.log("Local Host Server started at 3007");
  });
};

initializeServerAndDatabase();

app.use(express.json());

app.post("/register/", async (req, res) => {
  const { username, name, password, gender, location } = req.body;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const selectUserQuery = `Select * from user where username='${username}' `;
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    if (password.length < 5) {
      res.status = 400;
      res.send("Password is too short");
    } else {
      const createUserQuery = `
        INSERT INTO user(username, name, password, gender, location)
        values(
            '${username}',
            '${name}',
            '${hashedPassword}',
            '${gender}',
            '${location}'
        )
        `;
      const dbResponse = await db.run(createUserQuery);
      const newUserId = dbResponse.lastID;
      res.status = 200;
      res.send("User created successfully");
    }
  } else {
    res.status = 400;
    res.send("User already exists");
  }
});

app.post("/login/", async (req, res) => {
  const { username, password } = req.body;
  const selectUserQuery = `Select * from user where username='${username}' `;
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    res.status = 400;
    res.send("Invalid user");
  } else {
    const validatePassword = await bcrypt.compare(password, dbUser.password);

    if (validatePassword) {
      res.status = 200;
      res.send("Login success!");
    } else {
      res.status = 400;
      res.send("Invalid password");
    }
  }
});

app.put("/change-password", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  const selectUserQuery = `Select * from user where username='${username}' `;
  const dbUser = await db.get(selectUserQuery);
  const hashed = await bcrypt.compare(dbUser.password, oldPassword);

  if (hashed) {
    res.status = 400;
    res.send("Invalid current password");
  } else {
    if (newPassword.length < 5) {
      res.status = 400;
      res.send("Password is too short");
    } else {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const putUserQuery = `update user set password='${hashedPassword}' where username='${username}' `;
      await db.run(selectUserQuery);
      res.status = 200;
      res.send("Password updated");
    }
  }
});
module.exports = app;
