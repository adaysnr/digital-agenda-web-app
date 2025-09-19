const User = require("./User");
const PomodoroTask = require("./PomodoroTask");
const CalendarEvent = require("./CalendarEvent");
const Tasks = require("./Tasks");
const Notes = require("./Notes");

// Pomodoro görevleri için ilişkileri tanımla
User.hasMany(PomodoroTask, { foreignKey: "userId" });
PomodoroTask.belongsTo(User, { foreignKey: "userId" });

// Takvim etkinlikleri için ilişkileri tanımla
User.hasMany(CalendarEvent, { foreignKey: "userId" });
CalendarEvent.belongsTo(User, { foreignKey: "userId" });

// Görevler için ilişkileri tanımla
User.hasMany(Tasks, { foreignKey: "userId" });
Tasks.belongsTo(User, { foreignKey: "userId" });

// Notlar için ilişkileri tanımla
User.hasMany(Notes, { foreignKey: "userId" });
Notes.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  User,
  PomodoroTask,
  CalendarEvent,
  Tasks,
  Notes,
};
