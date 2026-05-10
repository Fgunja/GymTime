const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const CjenikGT = sequelize.define(
  "CjenikGT",
  {
    cjenik_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    naziv_paketa: { type: DataTypes.STRING },
    cijena: { type: DataTypes.DECIMAL(10, 2) },
    trajanje_dana: { type: DataTypes.INTEGER },
    opis: { type: DataTypes.TEXT },
  },
  {
    tableName: "cjenikGT",
    timestamps: false,
  },
);

module.exports = CjenikGT;
