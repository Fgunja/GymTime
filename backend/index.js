const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Sequelize, DataTypes, Op } = require("sequelize");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const JWT_SECRET = "gymtime";

// =======================
// SEQUELIZE KONFIGURACIJA
// =======================
const sequelize = new Sequelize("fgunja", "fgunja", "11", {
  host: "student.veleri.hr",
  dialect: "mysql",
  timezone: "+02:00",
  define: { timestamps: false },
});

// =======================
// MODELI
// =======================
const KorisnikGT = sequelize.define(
  "korisnikGT",
  {
    korisnik_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: { type: DataTypes.STRING },
    ime: { type: DataTypes.STRING },
    prezime: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    lozinka: { type: DataTypes.STRING },
    uloga: { type: DataTypes.STRING },
    datum_registracije: { type: DataTypes.DATEONLY },
  },
  { tableName: "korisnikGT" },
);

const CjenikGT = sequelize.define(
  "cjenikGT",
  {
    cjenik_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    naziv_paketa: { type: DataTypes.STRING },
    cijena: { type: DataTypes.FLOAT },
    trajanje_dana: { type: DataTypes.INTEGER },
    opis: { type: DataTypes.STRING },
  },
  { tableName: "cjenikGT" },
);

const TerminGT = sequelize.define(
  "terminGT",
  {
    termin_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    datum: { type: DataTypes.DATEONLY },
    vrijeme: { type: DataTypes.STRING },
    korisnik_id: { type: DataTypes.INTEGER },
    trajanje: { type: DataTypes.INTEGER },
    vrsta_treninga: { type: DataTypes.STRING },
    opis: { type: DataTypes.STRING },
    max_kapacitet: { type: DataTypes.INTEGER },
  },
  { tableName: "terminGT" },
);

const RezervacijaGT = sequelize.define(
  "rezervacijaGT",
  {
    rezervacija_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    korisnik_id: { type: DataTypes.INTEGER },
    termin_id: { type: DataTypes.INTEGER },
    datum_rezervacije: { type: DataTypes.DATEONLY },
    status_rezervacije: { type: DataTypes.STRING },
  },
  { tableName: "rezervacijaGT" },
);

const PretplataGT = sequelize.define(
  "pretplataGT",
  {
    pretplata_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    korisnik_id: { type: DataTypes.INTEGER },
    cjenik_id: { type: DataTypes.INTEGER },
    datum_pocetka: { type: DataTypes.DATEONLY },
    datum_isteka: { type: DataTypes.DATEONLY },
    status_pretplate: { type: DataTypes.STRING },
    naziv_pretplate: { type: DataTypes.STRING },
  },
  { tableName: "pretplataGT" },
);

const ObavijestGT = sequelize.define(
  "obavijestGT",
  {
    obavijest_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    korisnik_id: { type: DataTypes.INTEGER },
    poruka: { type: DataTypes.TEXT },
    datum_kreiranja: { type: DataTypes.DATE },
    procitano: { type: DataTypes.BOOLEAN },
  },
  { tableName: "obavijestGT" },
);

// =======================
// RELACIJE
// =======================
RezervacijaGT.belongsTo(TerminGT, { foreignKey: "termin_id" });
PretplataGT.belongsTo(CjenikGT, { foreignKey: "cjenik_id" });

// =======================
// SPAJANJE NA BAZU
// =======================
sequelize
  .authenticate()
  .then(() => console.log("Spojeno na bazu"))
  .catch((err) => console.log("DB error:", err));

// =======================
// JWT MIDDLEWARE
// =======================
function provjeriToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Niste prijavljeni" });
  try {
    req.korisnik = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Nevažeći token" });
  }
}

function provjeriAdmin(req, res, next) {
  if (req.korisnik.uloga !== "admin")
    return res.status(403).json({ message: "Nemate ovlasti" });
  next();
}

// =======================
// REGISTER
// =======================
app.post("/register", async (req, res) => {
  const { username, ime, prezime, email, lozinka } = req.body;
  if (!username || !email || !lozinka)
    return res.status(400).json({ message: "Nedostaju podaci" });
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
  if (!username || !lozinka)
    return res.status(400).json({ message: "Unesi podatke" });
  try {
    const user = await KorisnikGT.findOne({ where: { username } });
    if (!user) return res.status(401).json({ message: "Korisnik ne postoji" });
    const ok = await bcrypt.compare(lozinka, user.lozinka);
    if (!ok) return res.status(401).json({ message: "Pogrešna lozinka" });
    const userData = user.toJSON();
    delete userData.lozinka;
    const token = jwt.sign(
      { korisnik_id: userData.korisnik_id, uloga: userData.uloga },
      JWT_SECRET,
      { expiresIn: "8h" },
    );
    res.json({ message: "Login uspješan", user: userData, token });
  } catch {
    res.status(500).json({ message: "Greška servera" });
  }
});

// =======================
// CJENIK
// =======================
app.get("/cjenik", async (req, res) => {
  try {
    res.json(await CjenikGT.findAll());
  } catch {
    res.status(500).json({ message: "Greška kod dohvaćanja cjenika" });
  }
});

app.post("/cjenik", provjeriToken, provjeriAdmin, async (req, res) => {
  const { naziv_paketa, cijena, trajanje_dana, opis } = req.body;
  if (!naziv_paketa || !cijena || !trajanje_dana)
    return res.status(400).json({ message: "Nedostaju podaci" });
  try {
    await CjenikGT.create({ naziv_paketa, cijena, trajanje_dana, opis });
    res.json({ message: "Paket dodan" });
  } catch {
    res.status(500).json({ message: "Greška kod dodavanja paketa" });
  }
});

app.put(
  "/cjenik/:cjenik_id",
  provjeriToken,
  provjeriAdmin,
  async (req, res) => {
    const { naziv_paketa, cijena, trajanje_dana, opis } = req.body;
    if (!naziv_paketa || !cijena || !trajanje_dana)
      return res.status(400).json({ message: "Nedostaju podaci" });
    try {
      await CjenikGT.update(
        { naziv_paketa, cijena, trajanje_dana, opis },
        { where: { cjenik_id: req.params.cjenik_id } },
      );
      res.json({ message: "Paket ažuriran" });
    } catch {
      res.status(500).json({ message: "Greška kod ažuriranja paketa" });
    }
  },
);

// =======================
// TERMINI
// =======================
app.get("/termini", provjeriToken, async (req, res) => {
  try {
    res.json(
      await TerminGT.findAll({
        order: [
          ["datum", "ASC"],
          ["vrijeme", "ASC"],
        ],
      }),
    );
  } catch {
    res.status(500).json({ message: "Greška" });
  }
});

app.get("/termini/:termin_id", provjeriToken, async (req, res) => {
  try {
    const termin = await TerminGT.findByPk(req.params.termin_id);
    if (!termin) return res.status(404).json({ message: "Termin ne postoji" });
    res.json(termin);
  } catch {
    res.status(500).json({ message: "Greška" });
  }
});

app.get("/termini/:termin_id/popunjenost", provjeriToken, async (req, res) => {
  try {
    const broj = await RezervacijaGT.count({
      where: { termin_id: req.params.termin_id },
    });
    res.json({ broj });
  } catch {
    res.status(500).json({ message: "Greška" });
  }
});

app.post("/termini", provjeriToken, provjeriAdmin, async (req, res) => {
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
  } catch {
    res.status(500).json({ message: "Greška" });
  }
});

app.put(
  "/termini/:termin_id",
  provjeriToken,
  provjeriAdmin,
  async (req, res) => {
    const { datum, vrijeme, vrsta_treninga, opis, trajanje, max_kapacitet } =
      req.body;
    try {
      await TerminGT.update(
        { datum, vrijeme, vrsta_treninga, opis, trajanje, max_kapacitet },
        { where: { termin_id: req.params.termin_id } },
      );
      res.json({ message: "Termin ažuriran" });
    } catch {
      res.status(500).json({ message: "Greška" });
    }
  },
);

app.delete(
  "/termini/:termin_id",
  provjeriToken,
  provjeriAdmin,
  async (req, res) => {
    const termin_id = req.params.termin_id;
    try {
      const termin = await TerminGT.findByPk(termin_id);
      if (!termin)
        return res.status(404).json({ message: "Termin ne postoji" });
      await RezervacijaGT.destroy({ where: { termin_id } });
      await TerminGT.destroy({ where: { termin_id } });
      res.json({ message: "Termin obrisan" });
    } catch {
      res.status(500).json({ message: "Greška pri brisanju termina" });
    }
  },
);

// =======================
// REZERVACIJE
// =======================
app.get("/rezervacije/:korisnik_id", provjeriToken, async (req, res) => {
  try {
    const rezervacije = await RezervacijaGT.findAll({
      where: { korisnik_id: req.params.korisnik_id },
      include: [
        {
          model: TerminGT,
          attributes: ["datum", "vrijeme", "vrsta_treninga", "trajanje"],
        },
      ],
    });
    res.json(
      rezervacije.map((r) => ({
        ...r.toJSON(),
        datum: r.terminGT.datum,
        vrijeme: r.terminGT.vrijeme,
        vrsta_treninga: r.terminGT.vrsta_treninga,
        trajanje: r.terminGT.trajanje,
      })),
    );
  } catch {
    res.status(500).json({ message: "Greška" });
  }
});

app.post("/rezervacije", provjeriToken, async (req, res) => {
  const { korisnik_id, termin_id } = req.body;
  try {
    const pretplata = await PretplataGT.findOne({
      where: {
        korisnik_id,
        status_pretplate: "aktivna",
        datum_isteka: { [Op.gte]: new Date() },
      },
    });
    if (!pretplata)
      return res.status(403).json({ message: "Nemate aktivnu pretplatu" });

    const termin = await TerminGT.findByPk(termin_id);
    if (!termin) return res.status(500).json({ message: "Greška" });

    const broj = await RezervacijaGT.count({ where: { termin_id } });
    if (broj >= termin.max_kapacitet)
      return res.status(400).json({ message: "Termin je popunjen" });

    await RezervacijaGT.create({
      korisnik_id,
      termin_id,
      datum_rezervacije: new Date().toISOString().split("T")[0],
      status_rezervacije: "potvrđena",
    });
    res.json({ message: "Rezervacija kreirana" });
  } catch {
    res.status(500).json({ message: "Greška" });
  }
});

app.delete("/rezervacije/:rezervacija_id", provjeriToken, async (req, res) => {
  try {
    await RezervacijaGT.destroy({
      where: { rezervacija_id: req.params.rezervacija_id },
    });
    res.json({ message: "Rezervacija otkazana" });
  } catch {
    res.status(500).json({ message: "Greška" });
  }
});

// =======================
// PRETPLATA
// =======================
app.get("/pretplata/:korisnik_id", provjeriToken, async (req, res) => {
  try {
    const pretplata = await PretplataGT.findOne({
      where: {
        korisnik_id: req.params.korisnik_id,
        status_pretplate: "aktivna",
        datum_isteka: { [Op.gte]: new Date() },
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
    res.json({
      aktivna: true,
      pretplata: {
        ...pretplata.toJSON(),
        naziv_paketa: pretplata.cjenikGT.naziv_paketa,
        cijena: pretplata.cjenikGT.cijena,
        trajanje_dana: pretplata.cjenikGT.trajanje_dana,
      },
    });
  } catch {
    res.status(500).json({ message: "Greška" });
  }
});

app.post("/pretplata", provjeriToken, async (req, res) => {
  const { korisnik_id, cjenik_id } = req.body;
  try {
    const paket = await CjenikGT.findByPk(cjenik_id);
    if (!paket) return res.status(500).json({ message: "Paket ne postoji" });

    const datum_pocetka = new Date().toISOString().split("T")[0];
    const istekDate = new Date();
    istekDate.setDate(istekDate.getDate() + paket.trajanje_dana);
    const datum_isteka = istekDate.toISOString().split("T")[0];

    const aktivna = await PretplataGT.findOne({
      where: {
        korisnik_id,
        status_pretplate: "aktivna",
        datum_isteka: { [Op.gte]: new Date() },
      },
    });
    if (aktivna)
      return res.status(400).json({ message: "Već imate aktivnu pretplatu" });

    await PretplataGT.create({
      korisnik_id,
      cjenik_id,
      datum_pocetka,
      datum_isteka,
      status_pretplate: "aktivna",
      naziv_pretplate: paket.naziv_paketa,
    });
    res.json({ message: "Pretplata aktivirana!" });
  } catch {
    res.status(500).json({ message: "Greška kod aktivacije" });
  }
});

// =======================
// KORISNICI (admin)
// =======================
app.get("/korisnici", provjeriToken, provjeriAdmin, async (req, res) => {
  try {
    res.json(
      await KorisnikGT.findAll({
        attributes: [
          "korisnik_id",
          "username",
          "ime",
          "prezime",
          "email",
          "uloga",
          "datum_registracije",
        ],
      }),
    );
  } catch {
    res.status(500).json({ message: "Greška" });
  }
});

app.get(
  "/admin/pretplata/:korisnik_id",
  provjeriToken,
  provjeriAdmin,
  async (req, res) => {
    try {
      const pretplate = await PretplataGT.findAll({
        where: { korisnik_id: req.params.korisnik_id },
        include: [
          {
            model: CjenikGT,
            attributes: ["naziv_paketa", "cijena", "trajanje_dana"],
          },
        ],
        order: [["datum_pocetka", "DESC"]],
      });
      res.json(
        pretplate.map((p) => ({
          ...p.toJSON(),
          naziv_paketa: p.cjenikGT.naziv_paketa,
          cijena: p.cjenikGT.cijena,
          trajanje_dana: p.cjenikGT.trajanje_dana,
        })),
      );
    } catch {
      res.status(500).json({ message: "Greška" });
    }
  },
);

app.put(
  "/admin/pretplata/:pretplata_id",
  provjeriToken,
  provjeriAdmin,
  async (req, res) => {
    const { status_pretplate } = req.body;
    if (!["aktivna", "istekla", "otkazana"].includes(status_pretplate))
      return res.status(400).json({ message: "Nedozvoljen status" });
    try {
      await PretplataGT.update(
        { status_pretplate },
        { where: { pretplata_id: req.params.pretplata_id } },
      );
      res.json({ message: "Status pretplate ažuriran" });
    } catch {
      res.status(500).json({ message: "Greška" });
    }
  },
);

// =======================
// OBAVIJESTI
// =======================
app.get("/obavijesti", provjeriToken, provjeriAdmin, async (req, res) => {
  try {
    res.json(
      await ObavijestGT.findAll({ order: [["datum_kreiranja", "DESC"]] }),
    );
  } catch {
    res.status(500).json({ message: "Greška" });
  }
});

app.get("/obavijesti/:korisnik_id", provjeriToken, async (req, res) => {
  try {
    res.json(
      await ObavijestGT.findAll({
        where: { korisnik_id: req.params.korisnik_id },
        order: [["datum_kreiranja", "DESC"]],
      }),
    );
  } catch {
    res.status(500).json({ message: "Greška" });
  }
});

app.post("/obavijesti", provjeriToken, provjeriAdmin, async (req, res) => {
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
  } catch {
    res.status(500).json({ message: "Greška kod slanja" });
  }
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server radi na portu ${PORT}");
});
