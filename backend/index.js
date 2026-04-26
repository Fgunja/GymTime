const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

// =======================
// DB KONFIG
// =======================
const db = mysql.createConnection({
  host: "student.veleri.hr",
  user: "fgunja",
  password: "11",
  database: "fgunja",
});

db.connect((err) => {
  if (err) {
    console.log("DB error:", err);
  } else {
    console.log("Spojeno na bazu");
  }
});

// =======================
// REGISTER
// =======================
app.post("/register", async (req, res) => {
  const { username, ime, prezime, email, lozinka } = req.body;

  if (!username || !email || !lozinka) {
    return res.status(400).json({ message: "Nedostaju podaci" });
  }

  try {
    const hash = await bcrypt.hash(lozinka, 10);

    const sql = `
      INSERT INTO korisnikGT (username, ime, prezime, email, lozinka, uloga)
      VALUES (?, ?, ?, ?, ?, 'korisnik')
    `;

    db.query(sql, [username, ime, prezime, email, hash], (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Greška kod registracije" });
      }

      res.json({ message: "Registracija uspješna" });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// LOGIN
// =======================
app.post("/login", (req, res) => {
  const { username, lozinka } = req.body;

  if (!username || !lozinka) {
    return res.status(400).json({ message: "Unesi podatke" });
  }

  const sql = `SELECT * FROM korisnikGT WHERE username = ?`;

  db.query(sql, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Greška servera" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Korisnik ne postoji" });
    }

    const user = results[0];

    const ok = await bcrypt.compare(lozinka, user.lozinka);

    if (!ok) {
      return res.status(401).json({ message: "Pogrešna lozinka" });
    }

    delete user.lozinka;

    res.json({
      message: "Login uspješan",
      user,
    });
  });
});

// =======================
// 📦 CJENIK - NOVO
// =======================
app.get("/cjenik", (req, res) => {
  const sql = "SELECT * FROM cjenikGT";

  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Greška kod dohvaćanja cjenika" });
    }

    res.json(results);
  });
});

// =======================
// START SERVER
// =======================
app.listen(3000, () => {
  console.log("Server radi na http://localhost:3000");
});
