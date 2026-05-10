const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const PretplataGT = sequelize.define(
  "PretplataGT",
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
  {
    tableName: "pretplataGT",
    timestamps: false,
  },
);

module.exports = PretplataGT;
