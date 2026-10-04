const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

class Post extends Model {}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Post",
    tableName: "Posts",

    paranoid: true,
  }
);

module.exports = Post;