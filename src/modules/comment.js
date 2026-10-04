const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

class Comment extends Model {}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Comment",
    tableName: "Comments",
  }
);

module.exports = Comment;