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
  const selectUserQuery = `Select * from user where username=${username}`;
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    if (length(password) < 5) {
      response.status = 400;
      response.send("Password is too short");
    } else {
      const createUserQuery = `
        INSERT INTO user(username, name, password, gender, location)
        values(
            '${username}',
            '${name}',
            '${hashedPassword}',
            '${gender}',
            '${location}
        )
        `;
      const dbResponse = await db.run(createUserQuery);
      const newUserId = dbResponse.lastID;
      response.status = 200;
      response.send("User created successfully");
    }
  } else {
    response.status = 400;
    response.send("User already exists");
  }
});
module.exports = app;
