const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// PomodoroTask modeli
const PomodoroTask = sequelize.define(
  "PomodoroTask",
  {
    // "id" alanı otomatik olarak oluşturulur
    taskContent: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "task_content",
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_completed",
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
    tableName: "pomodoro_tasks",
    timestamps: true,
    underscored: true,
  }
);

module.exports = PomodoroTask;
