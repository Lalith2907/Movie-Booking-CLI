const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const csvParser = require("csv-parser");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.json());

app.post("/add-user", (req, res) => {
  const { name, email, mobile, movie, seat } = req.body;
  const newUser = `${name},${email},${mobile},${movie},${seat}\n`;
  fs.appendFile("data.csv", newUser, (err) => {
    if (err) {
      res.status(500).send("Error saving details.");
    } else {
      res.send("Details saved successfully.");
    }
  });
});

app.get("/search-users", (req, res) => {
  const searchName = req.query.name.toLowerCase();
  const users = [];
  fs.createReadStream("data.csv")
    .pipe(csvParser({ headers: ["name", "email", "mobile", "movie", "seat"] }))
    .on("data", (row) => {
      if (row.name.toLowerCase().includes(searchName)) {
        users.push(row);
      }
    })
    .on("end", () => {
      res.json(users);
    });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});