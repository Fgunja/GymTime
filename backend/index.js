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
    if (err) return res.status(500).json({ message: "Greška servera" });
    if (results.length === 0) return res.status(401).json({ message: "Korisnik ne postoji" });

    const user = results[0];
    const ok = await bcrypt.compare(lozinka, user.lozinka);
    if (!ok) return res.status(401).json({ message: "Pogrešna lozinka" });

    delete user.lozinka;
    res.json({ message: "Login uspješan", user });
  });
});

// =======================
// CJENIK
// =======================

// Dohvati sve pakete
app.get("/cjenik", (req, res) => {
  db.query("SELECT * FROM cjenikGT", (err, results) => {
    if (err) return res.status(500).json({ message: "Greška kod dohvaćanja cjenika" });
    res.json(results);
  });
});

// Dodaj novi paket (admin)
app.post("/cjenik", (req, res) => {
  const { naziv_paketa, cijena, trajanje_dana, opis } = req.body;
  if (!naziv_paketa || !cijena || !trajanje_dana) {
    return res.status(400).json({ message: "Nedostaju podaci" });
  }
  const sql = `INSERT INTO cjenikGT (naziv_paketa, cijena, trajanje_dana, opis) VALUES (?, ?, ?, ?)`;
  db.query(sql, [naziv_paketa, cijena, trajanje_dana, opis], (err) => {
    if (err) return res.status(500).json({ message: "Greška kod dodavanja paketa" });
    res.json({ message: "Paket dodan" });
  });
});

// Uredi paket (admin)
app.put("/cjenik/:cjenik_id", (req, res) => {
  const { naziv_paketa, cijena, trajanje_dana, opis } = req.body;
  if (!naziv_paketa || !cijena || !trajanje_dana) {
    return res.status(400).json({ message: "Nedostaju podaci" });
  }
  const sql = `UPDATE cjenikGT SET naziv_paketa = ?, cijena = ?, trajanje_dana = ?, opis = ? WHERE cjenik_id = ?`;
  db.query(sql, [naziv_paketa, cijena, trajanje_dana, opis, req.params.cjenik_id], (err) => {
    if (err) return res.status(500).json({ message: "Greška kod ažuriranja paketa" });
    res.json({ message: "Paket ažuriran" });
  });
});

// =======================
// TERMINI
// =======================

// Dohvati sve termine
app.get("/termini", (req, res) => {
  db.query("SELECT * FROM terminGT ORDER BY datum, vrijeme", (err, results) => {
    if (err) return res.status(500).json({ message: "Greška" });
    res.json(results);
  });
});

// Dohvati detalje jednog termina
app.get("/termini/:termin_id", (req, res) => {
  db.query(
    "SELECT * FROM terminGT WHERE termin_id = ?",
    [req.params.termin_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Greška" });
      if (results.length === 0) return res.status(404).json({ message: "Termin ne postoji" });
      res.json(results[0]);
    }
  );
});

// Dodaj novi termin (admin)
app.post("/termini", (req, res) => {
  const { datum, vrijeme, korisnik_id, trajanje, vrsta_treninga, opis, max_kapacitet } = req.body;
  const sql = `INSERT INTO terminGT (datum, vrijeme, korisnik_id, trajanje, vrsta_treninga, opis, max_kapacitet) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [datum, vrijeme, korisnik_id, trajanje, vrsta_treninga, opis, max_kapacitet], (err) => {
    if (err) return res.status(500).json({ message: "Greška" });
    res.json({ message: "Termin kreiran" });
  });
});

// Obriši termin (admin)
app.delete("/termini/:termin_id", (req, res) => {
  const termin_id = req.params.termin_id;

  // 🔧 POPRAVAK: prvo provjeri postoji li termin
  db.query(
    "SELECT termin_id FROM terminGT WHERE termin_id = ?",
    [termin_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Greška pri provjeri termina" });
      if (results.length === 0) return res.status(404).json({ message: "Termin ne postoji" });

      // Obriši rezervacije za taj termin
      db.query(
        "DELETE FROM rezervacijaGT WHERE termin_id = ?",
        [termin_id],
        (err) => {
          if (err) return res.status(500).json({ message: "Greška pri brisanju rezervacija" });

          // Obriši termin
          db.query(
            "DELETE FROM terminGT WHERE termin_id = ?",
            [termin_id],
            (err) => {
              if (err) return res.status(500).json({ message: "Greška pri brisanju termina" });
              res.json({ message: "Termin obrisan" });
            }
          );
        }
      );
    }
  );
});

// =======================
// REZERVACIJE
// =======================

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
    if (pretplate.length === 0)
      return res.status(403).json({ message: "Nemate aktivnu pretplatu" });

    // 2. Provjeri kapacitet
    const sqlBroj = `SELECT COUNT(*) as broj FROM rezervacijaGT WHERE termin_id = ?`;
    db.query(sqlBroj, [termin_id], (err, count) => {
      if (err) return res.status(500).json({ message: "Greška" });

      const sqlMax = `SELECT max_kapacitet FROM terminGT WHERE termin_id = ?`;
      db.query(sqlMax, [termin_id], (err, termin) => {
        if (err || termin.length === 0) return res.status(500).json({ message: "Greška" });
        if (count[0].broj >= termin[0].max_kapacitet)
          return res.status(400).json({ message: "Termin je popunjen" });

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

// Otkaži rezervaciju
app.delete("/rezervacije/:rezervacija_id", (req, res) => {
  db.query(
    "DELETE FROM rezervacijaGT WHERE rezervacija_id = ?",
    [req.params.rezervacija_id],
    (err) => {
      if (err) return res.status(500).json({ message: "Greška" });
      res.json({ message: "Rezervacija otkazana" });
    }
  );
});

// =======================
// PRETPLATA
// =======================

// Dohvati aktivnu pretplatu korisnika
app.get("/pretplata/:korisnik_id", (req, res) => {
  const sql = `
    SELECT p.*, c.naziv_paketa, c.cijena, c.trajanje_dana
    FROM pretplataGT p
    JOIN cjenikGT c ON p.cjenik_id = c.cjenik_id
    WHERE p.korisnik_id = ? AND p.status_pretplate = 'aktivna' AND p.datum_isteka >= CURDATE()
    ORDER BY p.datum_pocetka DESC
    LIMIT 1
  `;
  db.query(sql, [req.params.korisnik_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Greška" });
    if (results.length === 0) return res.json({ aktivna: false });
    res.json({ aktivna: true, pretplata: results[0] });
  });
});

// Aktiviraj pretplatu
app.post("/pretplata", (req, res) => {
  const { korisnik_id, cjenik_id } = req.body;

  const sqlCjenik = `SELECT * FROM cjenikGT WHERE cjenik_id = ?`;
  db.query(sqlCjenik, [cjenik_id], (err, rezultat) => {
    if (err || rezultat.length === 0)
      return res.status(500).json({ message: "Paket ne postoji" });

    const paket = rezultat[0];
    const datum_pocetka = new Date().toISOString().split("T")[0];
    const istekDate = new Date();
    istekDate.setDate(istekDate.getDate() + paket.trajanje_dana);
    const datum_isteka = istekDate.toISOString().split("T")[0];

    const sqlProvjera = `
      SELECT * FROM pretplataGT
      WHERE korisnik_id = ? AND status_pretplate = 'aktivna' AND datum_isteka >= CURDATE()
    `;
    db.query(sqlProvjera, [korisnik_id], (err, aktivne) => {
      if (err) return res.status(500).json({ message: "Greška" });
      if (aktivne.length > 0)
        return res.status(400).json({ message: "Već imate aktivnu pretplatu" });

      const sqlInsert = `
        INSERT INTO pretplataGT (korisnik_id, cjenik_id, datum_pocetka, datum_isteka, status_pretplate, naziv_pretplate)
        VALUES (?, ?, ?, ?, 'aktivna', ?)
      `;
      db.query(sqlInsert, [korisnik_id, cjenik_id, datum_pocetka, datum_isteka, paket.naziv_paketa], (err) => {
        if (err) return res.status(500).json({ message: "Greška kod aktivacije" });
        res.json({ message: "Pretplata aktivirana!" });
      });
    });
  });
});

// =======================
// KORISNICI (admin)
// =======================

// Dohvati sve korisnike
app.get("/korisnici", (req, res) => {
  const sql = `SELECT korisnik_id, username, ime, prezime, email, uloga, datum_registracije FROM korisnikGT`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Greška" });
    res.json(results);
  });
});

// Dohvati sve pretplate jednog korisnika (admin)
app.get("/admin/pretplata/:korisnik_id", (req, res) => {
  const sql = `
    SELECT p.*, c.naziv_paketa, c.cijena, c.trajanje_dana
    FROM pretplataGT p
    JOIN cjenikGT c ON p.cjenik_id = c.cjenik_id
    WHERE p.korisnik_id = ?
    ORDER BY p.datum_pocetka DESC
  `;
  db.query(sql, [req.params.korisnik_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Greška" });
    res.json(results);
  });
});

// Promijeni status pretplate (admin)
app.put("/admin/pretplata/:pretplata_id", (req, res) => {
  const { status_pretplate } = req.body;
  const dozvoljeni = ["aktivna", "istekla", "otkazana"];
  if (!dozvoljeni.includes(status_pretplate))
    return res.status(400).json({ message: "Nedozvoljen status" });

  const sql = `UPDATE pretplataGT SET status_pretplate = ? WHERE pretplata_id = ?`;
  db.query(sql, [status_pretplate, req.params.pretplata_id], (err) => {
    if (err) return res.status(500).json({ message: "Greška" });
    res.json({ message: "Status pretplate ažuriran" });
  });
});

// =======================
// OBAVIJESTI
// =======================

// Admin: dohvati sve obavijesti
app.get("/obavijesti", (req, res) => {
  db.query(
    "SELECT * FROM obavijestGT ORDER BY datum_kreiranja DESC",
    (err, results) => {
      if (err) return res.status(500).json({ message: "Greška" });
      res.json(results);
    }
  );
});

// Korisnik: dohvati svoje obavijesti
app.get("/obavijesti/:korisnik_id", (req, res) => {
  db.query(
    "SELECT * FROM obavijestGT WHERE korisnik_id = ? ORDER BY datum_kreiranja DESC",
    [req.params.korisnik_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Greška" });
      res.json(results);
    }
  );
});

// Admin: pošalji obavijest jednom korisniku
app.post("/obavijesti", (req, res) => {
  const { korisnik_id, poruka } = req.body;
  
  if (!korisnik_id || !poruka)
    return res.status(400).json({ message: "Nedostaju podaci" });

  const sql = `INSERT INTO obavijestGT (korisnik_id, poruka, datum_kreiranja, procitano) VALUES (?, ?, NOW(), 0)`;
  db.query(sql, [korisnik_id, poruka], (err) => {
    if (err) {
      return res.status(500).json({ message: "Greška kod slanja" });
    }
    res.json({ message: "Obavijest poslana" });
  });
});

// =======================
// START SERVER
// =======================
app.listen(3000, () => {
  console.log("Server radi na http://localhost:3000");
});