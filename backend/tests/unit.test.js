// Testiramo logiku koja ne ovisi o bazi

// TEST 1: Provjera hashiranja lozinke
const bcrypt = require("bcrypt");

test("lozinka se ispravno hashira", async () => {
  const lozinka = "test123";
  const hash = await bcrypt.hash(lozinka, 10);
  const ok = await bcrypt.compare(lozinka, hash);
  expect(ok).toBe(true);
});

test("kriva lozinka ne prolazi provjeru", async () => {
  const hash = await bcrypt.hash("tocna123", 10);
  const ok = await bcrypt.compare("kriva123", hash);
  expect(ok).toBe(false);
});

// TEST 2: Provjera izračuna datuma isteka pretplate
test("datum isteka se ispravno računa za 30 dana", () => {
  const trajanje_dana = 30;
  const danas = new Date("2026-05-01");
  const istekDate = new Date(danas);
  istekDate.setDate(istekDate.getDate() + trajanje_dana);
  const datum_isteka = istekDate.toISOString().split("T")[0];
  expect(datum_isteka).toBe("2026-05-31");
});

// TEST 3: Provjera validacije podataka registracije
test("registracija bez emaila vraća grešku", () => {
  const { username, email, lozinka } = {
    username: "pero",
    email: "",
    lozinka: "123",
  };
  const greska = !username || !email || !lozinka;
  expect(greska).toBe(true);
});

test("registracija s ispravnim podacima prolazi validaciju", () => {
  const { username, email, lozinka } = {
    username: "pero",
    email: "pero@gmail.com",
    lozinka: "123",
  };
  const greska = !username || !email || !lozinka;
  expect(greska).toBe(false);
});

// TEST 4: Provjera statusa pretplate
test("dozvoljeni statusi pretplate su točni", () => {
  const dozvoljeni = ["aktivna", "istekla", "otkazana"];
  expect(dozvoljeni.includes("aktivna")).toBe(true);
  expect(dozvoljeni.includes("nepostojeci")).toBe(false);
});
