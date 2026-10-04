const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");
  


const checkNameLength = (name) => {
  if (name.length <= 2) {
    throw new Error("Name must be greater than 2 characters");
  }
};
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,

      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,

      validate: {
        checkPasswordLength(value) {
          if (value.length <= 6) {
            throw new Error("Password must be greater than 6 characters");
          }
        },
      },
    },

    role: {
      type: DataTypes.ENUM("user", "admin"),
      allowNull: false,
      defaultValue: "user",
    },
  },

  {
    tableName: "Users",

    hooks: {
      beforeCreate: (user) => {
        if (user.name.length <= 2) {
          throw new Error("Name must be greater than 2 characters");
        }
      },
    },
  }
);

module.exports = User;