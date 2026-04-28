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
  dateStrings: true,
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

// Dohvati sve termine
app.get("/termini", (req, res) => {
  db.query("SELECT * FROM terminGT ORDER BY datum, vrijeme", (err, results) => {
    if (err) return res.status(500).json({ message: "Greška" });
    res.json(results);
  });
});

// Dohvati rezervacije korisnika
app.get("/rezervacije/:korisnik_id", (req, res) => {
  const sql = `
    SELECT r.*, t.datum, t.vrijeme, t.vrsta_treninga, t.trajanje
    FROM rezervacijaGT r
    JOIN terminGT t ON r.termin_id = t.termin_id
    WHERE r.korisnik_id = ?
  `;
  db.query(sql, [req.params.korisnik_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Greška" });
    res.json(results);
  });
});

// Kreiraj rezervaciju
app.post("/rezervacije", (req, res) => {
  const { korisnik_id, termin_id } = req.body;

  // 1. Provjeri aktivnu pretplatu
  const sqlPretplata = `
    SELECT * FROM pretplataGT 
    WHERE korisnik_id = ? AND status_pretplate = 'aktivna' AND datum_isteka >= CURDATE()
  `;
  db.query(sqlPretplata, [korisnik_id], (err, pretplate) => {
    if (err) return res.status(500).json({ message: "Greška" });
    if (pretplate.length === 0) return res.status(403).json({ message: "Nemate aktivnu pretplatu" });

    // 2. Provjeri kapacitet
    const sqlBroj = `SELECT COUNT(*) as broj FROM rezervacijaGT WHERE termin_id = ?`;
    db.query(sqlBroj, [termin_id], (err, count) => {
      if (err) return res.status(500).json({ message: "Greška" });

      const sqlMax = `SELECT max_kapacitet FROM terminGT WHERE termin_id = ?`;
      db.query(sqlMax, [termin_id], (err, termin) => {
        if (err || termin.length === 0) return res.status(500).json({ message: "Greška" });
        if (count[0].broj >= termin[0].max_kapacitet) return res.status(400).json({ message: "Termin je popunjen" });

        // 3. Kreiraj rezervaciju
        const sql = `
          INSERT INTO rezervacijaGT (korisnik_id, termin_id, datum_rezervacije, status_rezervacije)
          VALUES (?, ?, CURDATE(), 'potvrđena')
        `;
        db.query(sql, [korisnik_id, termin_id], (err) => {
          if (err) return res.status(500).json({ message: "Greška" });
          res.json({ message: "Rezervacija kreirana" });
        });
      });
    });
  });
});

// Dodavanje novih termina (za admina)
app.post("/termini", (req, res) => {
  const { datum, vrijeme, korisnik_id, trajanje, vrsta_treninga, opis, max_kapacitet } = req.body;
  const sql = `INSERT INTO terminGT (datum, vrijeme, korisnik_id, trajanje, vrsta_treninga, opis, max_kapacitet) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [datum, vrijeme, korisnik_id, trajanje, vrsta_treninga, opis, max_kapacitet], (err) => {
    if (err) return res.status(500).json({ message: "Greška" });
    res.json({ message: "Termin kreiran" });
  });
});

// Dohvat detalja termina
app.get("/termini/:termin_id", (req, res) => {
  db.query("SELECT * FROM terminGT WHERE termin_id = ?", [req.params.termin_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Greška" });
    if (results.length === 0) return res.status(404).json({ message: "Termin ne postoji" });
    res.json(results[0]);
  });
});

// Otkaži rezervaciju
app.delete("/rezervacije/:rezervacija_id", (req, res) => {
  db.query("DELETE FROM rezervacijaGT WHERE rezervacija_id = ?", [req.params.rezervacija_id], (err) => {
    if (err) return res.status(500).json({ message: "Greška" });
    res.json({ message: "Rezervacija otkazana" });
  });
});

// =======================
// START SERVER
// =======================
app.listen(3000, () => {
  console.log("Server radi na http://localhost:3000");
});
