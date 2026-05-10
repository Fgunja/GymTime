const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const TerminGT = sequelize.define(
  "TerminGT",
  {
    termin_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    datum: { type: DataTypes.DATEONLY },
    vrijeme: { type: DataTypes.TIME },
    korisnik_id: { type: DataTypes.INTEGER },
    trajanje: { type: DataTypes.INTEGER },
    vrsta_treninga: { type: DataTypes.STRING },
    opis: { type: DataTypes.TEXT },
    max_kapacitet: { type: DataTypes.INTEGER },
  },
  {
    tableName: "terminGT",
    timestamps: false,
  },
);

module.exports = TerminGT;
