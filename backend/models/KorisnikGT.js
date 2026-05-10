const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const KorisnikGT = sequelize.define(
  "KorisnikGT",
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
  {
    tableName: "korisnikGT",
    timestamps: false,
  },
);

module.exports = KorisnikGT;
