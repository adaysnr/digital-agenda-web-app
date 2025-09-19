const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcrypt");

// User modeli
const User = sequelize.define(
  "User",
  {
    // "id" alanı otomatik olarak oluşturulur
    namesurname: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "name_surname",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "email",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "password",
    },
  },
  {
    tableName: "users",
    timestamps: true, // created_at ve updated_at alanlarını ekler
    underscored: true, // alan adlarını snake_case yapar
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        // Eğer şifre değiştirildiyse hashle
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Şifre karşılaştırma metodu
User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
