const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const PasswordReset = sequelize.define(
  "PasswordReset",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(64), // hex formatındaki token için yeterli uzunluk
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "password_resets",
    timestamps: true,
  }
);

module.exports = PasswordReset;
