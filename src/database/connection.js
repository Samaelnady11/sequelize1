const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("social_media", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;