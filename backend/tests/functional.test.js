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
