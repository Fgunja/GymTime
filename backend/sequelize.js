const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("fgunja", "fgunja", "11", {
  host: "student.veleri.hr",
  dialect: "mysql",
  timezone: "+01:00",
});

module.exports = sequelize;
