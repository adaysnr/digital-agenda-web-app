const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// Takvim modeli
const CalendarEvent = sequelize.define(
  "Calendar",
  {
    // "id" alanı otomatik olarak oluşturulur
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "description",
    },
    eventDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "event_date",
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: "start_time",
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: "end_time",
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
    isAllDay: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_all_day",
    },
  },
  {
    tableName: "calendar",
    timestamps: true,
    underscored: true,
  }
);

module.exports = CalendarEvent;
