const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const RezervacijaGT = sequelize.define(
  "RezervacijaGT",
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
  {
    tableName: "rezervacijaGT",
    timestamps: false,
  },
);

module.exports = RezervacijaGT;
