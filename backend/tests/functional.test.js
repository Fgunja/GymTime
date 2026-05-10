const request = require("supertest");
const express = require("express");
const cors = require("cors");

// Napravimo mini app samo za testove bez prave baze
const app = express();
app.use(cors());
app.use(express.json());

// Mock rute koje imitiraju pravo ponašanje
app.post("/login", (req, res) => {
  const { username, lozinka } = req.body;
  if (!username || !lozinka)
    return res.status(400).json({ message: "Unesi podatke" });
  if (username === "admin" && lozinka === "admin123")
    return res.json({
      message: "Login uspješan",
      user: { username: "admin", uloga: "admin" },
    });
  return res.status(401).json({ message: "Pogrešna lozinka" });
});

app.post("/register", (req, res) => {
  const { username, email, lozinka } = req.body;
  if (!username || !email || !lozinka)
    return res.status(400).json({ message: "Nedostaju podaci" });
  return res.json({ message: "Registracija uspješna" });
});

app.get("/cjenik", (req, res) => {
  res.json([
    { cjenik_id: 1, naziv_paketa: "Basic", cijena: 30, trajanje_dana: 30 },
    { cjenik_id: 2, naziv_paketa: "Premium", cijena: 50, trajanje_dana: 30 },
  ]);
});

app.get("/termini", (req, res) => {
  res.json([
    {
      termin_id: 1,
      datum: "2026-05-15",
      vrijeme: "10:00:00",
      vrsta_treninga: "Yoga",
      max_kapacitet: 10,
    },
  ]);
});

// TESTOVI
test("POST /login s ispravnim podacima vraća 200", async () => {
  const res = await request(app)
    .post("/login")
    .send({ username: "admin", lozinka: "admin123" });
  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe("Login uspješan");
});

test("POST /login bez podataka vraća 400", async () => {
  const res = await request(app).post("/login").send({});
  expect(res.statusCode).toBe(400);
});

test("POST /login s krivom lozinkom vraća 401", async () => {
  const res = await request(app)
    .post("/login")
    .send({ username: "admin", lozinka: "kriva" });
  expect(res.statusCode).toBe(401);
});

test("POST /register s ispravnim podacima vraća 200", async () => {
  const res = await request(app)
    .post("/register")
    .send({ username: "novi", email: "novi@gmail.com", lozinka: "123" });
  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe("Registracija uspješna");
});

test("POST /register bez emaila vraća 400", async () => {
  const res = await request(app)
    .post("/register")
    .send({ username: "novi", lozinka: "123" });
  expect(res.statusCode).toBe(400);
});

test("GET /cjenik vraća listu paketa", async () => {
  const res = await request(app).get("/cjenik");
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThan(0);
});

test("GET /termini vraća listu termina", async () => {
  const res = await request(app).get("/termini");
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

// Mock rute za rezervacije i pretplate
app.post("/rezervacije", (req, res) => {
  const { korisnik_id, termin_id } = req.body;
  if (!korisnik_id || !termin_id)
    return res.status(400).json({ message: "Nedostaju podaci" });
  return res.json({ message: "Rezervacija kreirana" });
});

app.delete("/rezervacije/:rezervacija_id", (req, res) => {
  const id = req.params.rezervacija_id;
  if (!id) return res.status(400).json({ message: "Nedostaje ID" });
  return res.json({ message: "Rezervacija otkazana" });
});

app.get("/pretplata/:korisnik_id", (req, res) => {
  const id = req.params.korisnik_id;
  if (id === "9") {
    return res.json({
      aktivna: true,
      pretplata: {
        naziv_pretplate: "Mjesečna pretplata",
        datum_pocetka: "2026-04-27",
        datum_isteka: "2026-05-27",
        CjenikGT: { naziv_paketa: "Mjesečna pretplata", cijena: 200 }
      }
    });
  }
  return res.json({ aktivna: false });
});

app.get("/termini/:termin_id/popunjenost", (req, res) => {
  res.json({ broj: 5 });
});

app.get("/obavijesti/:korisnik_id", (req, res) => {
  res.json([
    { obavijest_id: 1, poruka: "Test poruka", procitano: false, datum_kreiranja: "2026-05-03" }
  ]);
});

// TESTOVI za rezervacije
test("POST /rezervacije s ispravnim podacima vraća 200", async () => {
  const res = await request(app)
    .post("/rezervacije")
    .send({ korisnik_id: 9, termin_id: 1 });
  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe("Rezervacija kreirana");
});

test("POST /rezervacije bez podataka vraća 400", async () => {
  const res = await request(app).post("/rezervacije").send({});
  expect(res.statusCode).toBe(400);
});

test("DELETE /rezervacije/:id briše rezervaciju", async () => {
  const res = await request(app).delete("/rezervacije/1");
  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe("Rezervacija otkazana");
});

// TESTOVI za pretplatu
test("GET /pretplata/:id vraća aktivnu pretplatu za korisnika 9", async () => {
  const res = await request(app).get("/pretplata/9");
  expect(res.statusCode).toBe(200);
  expect(res.body.aktivna).toBe(true);
  expect(res.body.pretplata.CjenikGT.naziv_paketa).toBe("Mjesečna pretplata");
});

test("GET /pretplata/:id vraća neaktivnu pretplatu za nepostojećeg korisnika", async () => {
  const res = await request(app).get("/pretplata/999");
  expect(res.statusCode).toBe(200);
  expect(res.body.aktivna).toBe(false);
});

// TESTOVI za popunjenost i obavijesti
test("GET /termini/:id/popunjenost vraća broj rezervacija", async () => {
  const res = await request(app).get("/termini/1/popunjenost");
  expect(res.statusCode).toBe(200);
  expect(res.body.broj).toBe(5);
});

test("GET /obavijesti/:korisnik_id vraća listu obavijesti", async () => {
  const res = await request(app).get("/obavijesti/9");
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body[0].poruka).toBe("Test poruka");
});

// Mock rute za termine, pretplatu i korisnike
app.post("/termini", (req, res) => {
  const { datum, vrsta_treninga, max_kapacitet } = req.body;
  if (!datum || !vrsta_treninga || !max_kapacitet)
    return res.status(400).json({ message: "Nedostaju podaci" });
  const danas = new Date().toISOString().split("T")[0];
  if (datum < danas)
    return res.status(400).json({ message: "Ne možete dodati termin s prošlim datumom" });
  return res.json({ message: "Termin kreiran" });
});

app.put("/termini/:termin_id", (req, res) => {
  const { vrsta_treninga } = req.body;
  if (!vrsta_treninga)
    return res.status(400).json({ message: "Nedostaju podaci" });
  return res.json({ message: "Termin ažuriran" });
});

app.delete("/termini/:termin_id", (req, res) => {
  const id = req.params.termin_id;
  if (id === "999")
    return res.status(404).json({ message: "Termin ne postoji" });
  return res.json({ message: "Termin obrisan" });
});

app.post("/pretplata", (req, res) => {
  const { korisnik_id, cjenik_id } = req.body;
  if (!korisnik_id || !cjenik_id)
    return res.status(400).json({ message: "Nedostaju podaci" });
  if (korisnik_id === 99)
    return res.status(400).json({ message: "Već imate aktivnu pretplatu" });
  return res.json({ message: "Pretplata aktivirana!" });
});

app.post("/obavijesti", (req, res) => {
  const { korisnik_id, poruka } = req.body;
  if (!korisnik_id || !poruka)
    return res.status(400).json({ message: "Nedostaju podaci" });
  return res.json({ message: "Obavijest poslana" });
});

app.get("/korisnici", (req, res) => {
  res.json([
    { korisnik_id: 5, username: "admin", uloga: "admin" },
    { korisnik_id: 9, username: "Goran", uloga: "korisnik" },
  ]);
});

app.put("/admin/pretplata/:pretplata_id", (req, res) => {
  const { status_pretplate } = req.body;
  const dozvoljeni = ["aktivna", "istekla", "otkazana"];
  if (!dozvoljeni.includes(status_pretplate))
    return res.status(400).json({ message: "Nedozvoljen status" });
  return res.json({ message: "Status pretplate ažuriran" });
});

// TESTOVI za termine
test("POST /termini s ispravnim podacima vraća 200", async () => {
  const res = await request(app)
    .post("/termini")
    .send({ datum: "2030-12-31", vrsta_treninga: "Snaga", max_kapacitet: 15, korisnik_id: 5 });
  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe("Termin kreiran");
});

test("POST /termini s prošlim datumom vraća 400", async () => {
  const res = await request(app)
    .post("/termini")
    .send({ datum: "2026-01-01", vrsta_treninga: "Snaga", max_kapacitet: 15, korisnik_id: 5 });
  expect(res.statusCode).toBe(400);
  expect(res.body.message).toBe("Ne možete dodati termin s prošlim datumom");
});

test("POST /termini bez podataka vraća 400", async () => {
  const res = await request(app).post("/termini").send({});
  expect(res.statusCode).toBe(400);
});

test("PUT /termini/:id ažurira termin", async () => {
  const res = await request(app)
    .put("/termini/1")
    .send({ vrsta_treninga: "Kardio" });
  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe("Termin ažuriran");
});

test("DELETE /termini/:id briše termin", async () => {
  const res = await request(app).delete("/termini/1");
  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe("Termin obrisan");
});

test("DELETE /termini/:id vraća 404 za nepostojeći termin", async () => {
  const res = await request(app).delete("/termini/999");
  expect(res.statusCode).toBe(404);
});

// TESTOVI za pretplatu
test("POST /pretplata aktivira pretplatu", async () => {
  const res = await request(app)
    .post("/pretplata")
    .send({ korisnik_id: 9, cjenik_id: 1 });
  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe("Pretplata aktivirana!");
});

test("POST /pretplata vraća 400 ako već postoji aktivna pretplata", async () => {
  const res = await request(app)
    .post("/pretplata")
    .send({ korisnik_id: 99, cjenik_id: 1 });
  expect(res.statusCode).toBe(400);
});

test("POST /pretplata bez podataka vraća 400", async () => {
  const res = await request(app).post("/pretplata").send({});
  expect(res.statusCode).toBe(400);
});

// TESTOVI za obavijesti
test("POST /obavijesti šalje obavijest", async () => {
  const res = await request(app)
    .post("/obavijesti")
    .send({ korisnik_id: 9, poruka: "Test poruka" });
  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe("Obavijest poslana");
});

test("POST /obavijesti bez poruke vraća 400", async () => {
  const res = await request(app)
    .post("/obavijesti")
    .send({ korisnik_id: 9 });
  expect(res.statusCode).toBe(400);
});

// TESTOVI za korisnike i admin pretplatu
test("GET /korisnici vraća listu korisnika", async () => {
  const res = await request(app).get("/korisnici");
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThan(0);
});

test("PUT /admin/pretplata/:id ažurira status pretplate", async () => {
  const res = await request(app)
    .put("/admin/pretplata/1")
    .send({ status_pretplate: "istekla" });
  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe("Status pretplate ažuriran");
});

test("PUT /admin/pretplata/:id vraća 400 za nedozvoljen status", async () => {
  const res = await request(app)
    .put("/admin/pretplata/1")
    .send({ status_pretplate: "nepostojeci" });
  expect(res.statusCode).toBe(400);
});