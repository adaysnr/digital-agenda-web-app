const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// Görev modeli
const Tasks = sequelize.define(
  "Task",
  {
    // "id" alanı otomatik olarak oluşturulur
    taskHeader: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "task_header",
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_completed",
    },
    taskDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "task_date",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      defaultValue: "medium",
      field: "priority",
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
    tableName: "tasks",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Tasks;
