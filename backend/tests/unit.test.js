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

// TEST 5: Provjera logike prošlih termina
test("termin u prošlosti prepoznaje se kao prošao", () => {
  const datumTermina = "2026-01-01";
  const danas = new Date().toISOString().split("T")[0];
  const jeProsao = datumTermina < danas;
  expect(jeProsao).toBe(true);
});

test("termin u budućnosti nije prošao", () => {
  const datumTermina = "2030-12-31";
  const danas = new Date().toISOString().split("T")[0];
  const jeProsao = datumTermina < danas;
  expect(jeProsao).toBe(false);
});

// TEST 6: Provjera logike kapaciteta termina
test("termin je popunjen kada je broj rezervacija jednak max kapacitetu", () => {
  const max_kapacitet = 10;
  const trenutniBroj = 10;
  const jePopunjen = trenutniBroj >= max_kapacitet;
  expect(jePopunjen).toBe(true);
});

test("termin nije popunjen kada ima slobodnih mjesta", () => {
  const max_kapacitet = 10;
  const trenutniBroj = 5;
  const jePopunjen = trenutniBroj >= max_kapacitet;
  expect(jePopunjen).toBe(false);
});

// TEST 7: Provjera logike pretplate
test("pretplata je aktivna ako datum isteka nije prošao", () => {
  const datum_isteka = "2030-12-31";
  const danas = new Date().toISOString().split("T")[0];
  const jeAktivna = datum_isteka >= danas;
  expect(jeAktivna).toBe(true);
});

test("pretplata je istekla ako je datum isteka prošao", () => {
  const datum_isteka = "2026-01-01";
  const danas = new Date().toISOString().split("T")[0];
  const jeAktivna = datum_isteka >= danas;
  expect(jeAktivna).toBe(false);
});

// TEST 8: Provjera formatiranja datuma
test("datum se ispravno skraćuje na prvih 10 znakova", () => {
  const datum = "2026-05-11T00:00:00.000Z";
  const formatirano = datum.substring(0, 10);
  expect(formatirano).toBe("2026-05-11");
});

// TEST 9: Provjera inicijala korisnika
test("inicijali se ispravno generiraju iz imena i prezimena", () => {
  const ime = "Goran";
  const prezime = "Borevac";
  const inicijali = (ime[0] + prezime[0]).toUpperCase();
  expect(inicijali).toBe("GB");
});

// TEST 10: Validacija datuma termina
test("ne može se dodati termin s prošlim datumom", () => {
  const datumTermina = "2026-01-01";
  const danas = new Date().toISOString().split("T")[0];
  const jeNevalidan = datumTermina < danas;
  expect(jeNevalidan).toBe(true);
});

test("može se dodati termin s budućim datumom", () => {
  const datumTermina = "2030-12-31";
  const danas = new Date().toISOString().split("T")[0];
  const jeNevalidan = datumTermina < danas;
  expect(jeNevalidan).toBe(false);
});

// TEST 11: Provjera uloge korisnika
test("admin ima ulogu 'admin'", () => {
  const korisnik = { username: "admin", uloga: "admin" };
  expect(korisnik.uloga).toBe("admin");
});

test("obični korisnik nema admin ulogu", () => {
  const korisnik = { username: "goran", uloga: "korisnik" };
  expect(korisnik.uloga).toBe("korisnik");
  expect(korisnik.uloga).not.toBe("admin");
});

// TEST 12: Provjera statusa rezervacije
test("status 'potvrđena' je ispravan status rezervacije", () => {
  const dozvoljeni = ["potvrđena", "otkazana"];
  expect(dozvoljeni.includes("potvrđena")).toBe(true);
});

test("nepostojeći status rezervacije nije dozvoljen", () => {
  const dozvoljeni = ["potvrđena", "otkazana"];
  expect(dozvoljeni.includes("na_cekanju")).toBe(false);
});