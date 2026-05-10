const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const sequelize = require("./sequelize");

const KorisnikGT = require("./models/KorisnikGT");
const CjenikGT = require("./models/CjenikGT");
const TerminGT = require("./models/TerminGT");
const RezervacijaGT = require("./models/RezervacijaGT");
const PretplataGT = require("./models/PretplataGT");
const ObavijestGT = require("./models/ObavijestGT");

const app = express();

app.use(cors());
app.use(express.json());

// =======================
// ASOCIJACIJE
// =======================

// Korisnik ima mnogo rezervacija, rezervacija pripada korisniku
KorisnikGT.hasMany(RezervacijaGT, { foreignKey: "korisnik_id" });
RezervacijaGT.belongsTo(KorisnikGT, { foreignKey: "korisnik_id" });

// Korisnik ima mnogo pretplata, pretplata pripada korisniku
KorisnikGT.hasMany(PretplataGT, { foreignKey: "korisnik_id" });
PretplataGT.belongsTo(KorisnikGT, { foreignKey: "korisnik_id" });

// Korisnik ima mnogo obavijesti, obavijest pripada korisniku
KorisnikGT.hasMany(ObavijestGT, { foreignKey: "korisnik_id" });
ObavijestGT.belongsTo(KorisnikGT, { foreignKey: "korisnik_id" });

// Korisnik ima mnogo termina (trener), termin pripada korisniku
KorisnikGT.hasMany(TerminGT, { foreignKey: "korisnik_id" });
TerminGT.belongsTo(KorisnikGT, { foreignKey: "korisnik_id" });

// Termin ima mnogo rezervacija, rezervacija pripada terminu
TerminGT.hasMany(RezervacijaGT, { foreignKey: "termin_id" });
RezervacijaGT.belongsTo(TerminGT, { foreignKey: "termin_id" });

// Cjenik ima mnogo pretplata, pretplata pripada cjeniku
CjenikGT.hasMany(PretplataGT, { foreignKey: "cjenik_id" });
PretplataGT.belongsTo(CjenikGT, { foreignKey: "cjenik_id" });

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
    await KorisnikGT.create({
      username,
      ime,
      prezime,
      email,
      lozinka: hash,
      uloga: "korisnik",
    });
    res.json({ message: "Registracija uspješna" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Greška kod registracije" });
  }
});

// =======================
// LOGIN
// =======================
app.post("/login", async (req, res) => {
  const { username, lozinka } = req.body;

  if (!username || !lozinka) {
    return res.status(400).json({ message: "Unesi podatke" });
  }

  try {
    const user = await KorisnikGT.findOne({ where: { username } });
    if (!user) return res.status(401).json({ message: "Korisnik ne postoji" });

    const ok = await bcrypt.compare(lozinka, user.lozinka);
    if (!ok) return res.status(401).json({ message: "Pogrešna lozinka" });

    const userData = user.toJSON();
    delete userData.lozinka;
    res.json({ message: "Login uspješan", user: userData });
  } catch (err) {
    res.status(500).json({ message: "Greška servera" });
  }
});

// =======================
// CJENIK
// =======================

// Dohvati sve pakete
app.get("/cjenik", async (req, res) => {
  try {
    const results = await CjenikGT.findAll();
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Greška kod dohvaćanja cjenika" });
  }
});

// Dodaj novi paket (admin)
app.post("/cjenik", async (req, res) => {
  const { naziv_paketa, cijena, trajanje_dana, opis } = req.body;
  if (!naziv_paketa || !cijena || !trajanje_dana) {
    return res.status(400).json({ message: "Nedostaju podaci" });
  }
  try {
    await CjenikGT.create({ naziv_paketa, cijena, trajanje_dana, opis });
    res.json({ message: "Paket dodan" });
  } catch (err) {
    res.status(500).json({ message: "Greška kod dodavanja paketa" });
  }
});

// Uredi paket (admin)
app.put("/cjenik/:cjenik_id", async (req, res) => {
  const { naziv_paketa, cijena, trajanje_dana, opis } = req.body;
  if (!naziv_paketa || !cijena || !trajanje_dana) {
    return res.status(400).json({ message: "Nedostaju podaci" });
  }
  try {
    await CjenikGT.update(
      { naziv_paketa, cijena, trajanje_dana, opis },
      { where: { cjenik_id: req.params.cjenik_id } },
    );
    res.json({ message: "Paket ažuriran" });
  } catch (err) {
    res.status(500).json({ message: "Greška kod ažuriranja paketa" });
  }
});

// =======================
// TERMINI
// =======================

// Dohvati sve termine
app.get("/termini", async (req, res) => {
  try {
    const results = await TerminGT.findAll({
      order: [
        ["datum", "ASC"],
        ["vrijeme", "ASC"],
      ],
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Greška" });
  }
});

// Dohvati detalje jednog termina
app.get("/termini/:termin_id", async (req, res) => {
  try {
    const termin = await TerminGT.findOne({
      where: { termin_id: req.params.termin_id },
    });
    if (!termin) return res.status(404).json({ message: "Termin ne postoji" });
    res.json(termin);
  } catch (err) {
    res.status(500).json({ message: "Greška" });
  }
});

// Popunjenost kapaciteta
app.get("/termini/:termin_id/popunjenost", async (req, res) => {
  try {
    const broj = await RezervacijaGT.count({
      where: { termin_id: req.params.termin_id },
    });
    res.json({ broj });
  } catch (err) {
    res.status(500).json({ message: "Greška" });
  }
});

// Dodaj novi termin (admin)
app.post("/termini", async (req, res) => {
  const {
    datum,
    vrijeme,
    korisnik_id,
    trajanje,
    vrsta_treninga,
    opis,
    max_kapacitet,
  } = req.body;
  try {
    await TerminGT.create({
      datum,
      vrijeme,
      korisnik_id,
      trajanje,
      vrsta_treninga,
      opis,
      max_kapacitet,
    });
    res.json({ message: "Termin kreiran" });
  } catch (err) {
    res.status(500).json({ message: "Greška" });
  }
});

// Uredi termin (admin)
app.put("/termini/:termin_id", async (req, res) => {
  const { datum, vrijeme, vrsta_treninga, opis, trajanje, max_kapacitet } =
    req.body;
  try {
    await TerminGT.update(
      { datum, vrijeme, vrsta_treninga, opis, trajanje, max_kapacitet },
      { where: { termin_id: req.params.termin_id } },
    );
    res.json({ message: "Termin ažuriran" });
  } catch (err) {
    res.status(500).json({ message: "Greška" });
  }
});

// Obriši termin (admin)
app.delete("/termini/:termin_id", async (req, res) => {
  const termin_id = req.params.termin_id;
  try {
    const termin = await TerminGT.findOne({ where: { termin_id } });
    if (!termin) return res.status(404).json({ message: "Termin ne postoji" });

    await RezervacijaGT.destroy({ where: { termin_id } });
    await TerminGT.destroy({ where: { termin_id } });
    res.json({ message: "Termin obrisan" });
  } catch (err) {
    res.status(500).json({ message: "Greška pri brisanju termina" });
  }
});

// =======================
// REZERVACIJE
// =======================

// Dohvati rezervacije korisnika
app.get("/rezervacije/:korisnik_id", async (req, res) => {
  try {
    const results = await RezervacijaGT.findAll({
      where: { korisnik_id: req.params.korisnik_id },
      include: [
        {
          model: TerminGT,
          attributes: ["datum", "vrijeme", "vrsta_treninga", "trajanje"],
        },
      ],
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Greška" });
  }
});

// Kreiraj rezervaciju
app.post("/rezervacije", async (req, res) => {
  const { korisnik_id, termin_id } = req.body;
  const danas = new Date().toISOString().split("T")[0];
  try {
    const pretplata = await PretplataGT.findOne({
      where: {
        korisnik_id,
        status_pretplate: "aktivna",
        datum_isteka: { [Op.gte]: danas },
      },
    });
    if (!pretplata)
      return res.status(403).json({ message: "Nemate aktivnu pretplatu" });

    const termin = await TerminGT.findOne({ where: { termin_id } });
    if (!termin) return res.status(500).json({ message: "Greška" });

    const broj = await RezervacijaGT.count({ where: { termin_id } });
    if (broj >= termin.max_kapacitet)
      return res.status(400).json({ message: "Termin je popunjen" });

    await RezervacijaGT.create({
      korisnik_id,
      termin_id,
      datum_rezervacije: danas,
      status_rezervacije: "potvrđena",
    });
    res.json({ message: "Rezervacija kreirana" });
  } catch (err) {
    res.status(500).json({ message: "Greška" });
  }
});

// Otkaži rezervaciju
app.delete("/rezervacije/:rezervacija_id", async (req, res) => {
  try {
    await RezervacijaGT.destroy({
      where: { rezervacija_id: req.params.rezervacija_id },
    });
    res.json({ message: "Rezervacija otkazana" });
  } catch (err) {
    res.status(500).json({ message: "Greška" });
  }
});

// =======================
// PRETPLATA
// =======================

// Dohvati aktivnu pretplatu korisnika
app.get("/pretplata/:korisnik_id", async (req, res) => {
  const danas = new Date().toISOString().split("T")[0];
  try {
    const pretplata = await PretplataGT.findOne({
      where: {
        korisnik_id: req.params.korisnik_id,
        status_pretplate: "aktivna",
        datum_isteka: { [Op.gte]: danas },
      },
      include: [
        {
          model: CjenikGT,
          attributes: ["naziv_paketa", "cijena", "trajanje_dana"],
        },
      ],
      order: [["datum_pocetka", "DESC"]],
    });
    if (!pretplata) return res.json({ aktivna: false });
    res.json({ aktivna: true, pretplata });
  } catch (err) {
    res.status(500).json({ message: "Greška" });
  }
});

// Aktiviraj pretplatu
app.post("/pretplata", async (req, res) => {
  const { korisnik_id, cjenik_id } = req.body;
  const danas = new Date().toISOString().split("T")[0];
  try {
    const paket = await CjenikGT.findOne({ where: { cjenik_id } });
    if (!paket) return res.status(500).json({ message: "Paket ne postoji" });

    const aktivna = await PretplataGT.findOne({
      where: {
        korisnik_id,
        status_pretplate: "aktivna",
        datum_isteka: { [Op.gte]: danas },
      },
    });
    if (aktivna)
      return res.status(400).json({ message: "Već imate aktivnu pretplatu" });

    const istekDate = new Date();
    istekDate.setDate(istekDate.getDate() + paket.trajanje_dana);
    const datum_isteka = istekDate.toISOString().split("T")[0];

    await PretplataGT.create({
      korisnik_id,
      cjenik_id,
      datum_pocetka: danas,
      datum_isteka,
      status_pretplate: "aktivna",
      naziv_pretplate: paket.naziv_paketa,
    });
    res.json({ message: "Pretplata aktivirana!" });
  } catch (err) {
    res.status(500).json({ message: "Greška kod aktivacije" });
  }
});

// =======================
// KORISNICI (admin)
// =======================

// Dohvati sve korisnike
app.get("/korisnici", async (req, res) => {
  try {
    const results = await KorisnikGT.findAll({
      attributes: [
        "korisnik_id",
        "username",
        "ime",
        "prezime",
        "email",
        "uloga",
        "datum_registracije",
      ],
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Greška" });
  }
});

// Dohvati sve pretplate jednog korisnika (admin)
app.get("/admin/pretplata/:korisnik_id", async (req, res) => {
  try {
    const results = await PretplataGT.findAll({
      where: { korisnik_id: req.params.korisnik_id },
      include: [
        {
          model: CjenikGT,
          attributes: ["naziv_paketa", "cijena", "trajanje_dana"],
        },
      ],
      order: [["datum_pocetka", "DESC"]],
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Greška" });
  }
});

// Promijeni status pretplate (admin)
app.put("/admin/pretplata/:pretplata_id", async (req, res) => {
  const { status_pretplate } = req.body;
  const dozvoljeni = ["aktivna", "istekla", "otkazana"];
  if (!dozvoljeni.includes(status_pretplate))
    return res.status(400).json({ message: "Nedozvoljen status" });

  try {
    await PretplataGT.update(
      { status_pretplate },
      { where: { pretplata_id: req.params.pretplata_id } },
    );
    res.json({ message: "Status pretplate ažuriran" });
  } catch (err) {
    res.status(500).json({ message: "Greška" });
  }
});

// =======================
// OBAVIJESTI
// =======================

// Admin: dohvati sve obavijesti
app.get("/obavijesti", async (req, res) => {
  try {
    const results = await ObavijestGT.findAll({
      order: [["datum_kreiranja", "DESC"]],
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Greška" });
  }
});

// Korisnik: dohvati svoje obavijesti
app.get("/obavijesti/:korisnik_id", async (req, res) => {
  try {
    const results = await ObavijestGT.findAll({
      where: { korisnik_id: req.params.korisnik_id },
      order: [["datum_kreiranja", "DESC"]],
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Greška" });
  }
});

// Admin: pošalji obavijest jednom korisniku
app.post("/obavijesti", async (req, res) => {
  const { korisnik_id, poruka } = req.body;
  if (!korisnik_id || !poruka)
    return res.status(400).json({ message: "Nedostaju podaci" });

  try {
    await ObavijestGT.create({
      korisnik_id,
      poruka,
      datum_kreiranja: new Date(),
      procitano: false,
    });
    res.json({ message: "Obavijest poslana" });
  } catch (err) {
    res.status(500).json({ message: "Greška kod slanja" });
  }
});
app.put("/obavijesti/:obavijest_id/procitano", async (req, res) => {
  try {
    await ObavijestGT.update(
      { procitano: 1 },
      { where: { obavijest_id: req.params.obavijest_id } },
    );
    res.json({ message: "Obavijest označena kao pročitana" });
  } catch (err) {
    res.status(500).json({ message: "Greška" });
  }
});

// =======================
// START SERVER
// =======================
sequelize
  .authenticate()
  .then(() => {
    console.log("Sequelize spojen na bazu!");
    app.listen(3000, () => console.log("Server radi na http://localhost:3000"));
  })
  .catch((err) => console.error("Greška spajanja:", err));
