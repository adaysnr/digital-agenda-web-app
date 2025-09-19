const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// Notlar modeli
const Notes = sequelize.define(
  "Notes",
  {
    // "id" alanı otomatik olarak oluşturulur
    noteHeader: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "note_header",
    },
    noteContent: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "note_content",
    },
    noteDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "note_date",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "notes",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Notes;
