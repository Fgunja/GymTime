const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const ObavijestGT = sequelize.define(
  "ObavijestGT",
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
  {
    tableName: "obavijestGT",
    timestamps: false,
  },
);

module.exports = ObavijestGT;
