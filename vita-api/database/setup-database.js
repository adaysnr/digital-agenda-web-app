require("dotenv").config();
const { Client } = require("pg");

// Güvenli loglama fonksiyonu
function safeLog(message, error) {
  console.log(message);

  if (error) {
    // Hassas bilgileri içerebilecek alanları filtrele
    const safeError = {
      name: error.name,
      message: error.message,
      // Stack trace bilgisini üretim ortamında gösterme
      ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
    };

    console.error(JSON.stringify(safeError, null, 2));
  }
}

async function createDatabase() {
  // Ana veritabanına bağlan
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "postgres",
  });

  try {
    await client.connect();
    safeLog("Ana veritabanına bağlanıldı.");

    // Veritabanı var mı kontrol et
    const dbName = process.env.DB_NAME;
    const checkDb = await client.query(
      "SELECT FROM pg_database WHERE datname = $1",
      [dbName]
    );

    // Veritabanı yoksa oluştur
    if (checkDb.rowCount === 0) {
      safeLog(`${dbName} adında bir veritabanı bulunamadı.`);

      // Veritabanını oluştur
      if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
        throw new Error("Geçersiz veritabanı adı");
      }
      await client.query(`CREATE DATABASE "${dbName}"`);

      safeLog(`${dbName} adında veritabanı oluşturuldu.`);

      // Veritabanının hazır olması için biraz bekle
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      safeLog(`${dbName} adında bir veritabanı zaten var.`);
    }

    // Bağlantıyı düzgün şekilde kapat
    await client.end(); // Oluşturma/kontrol işlemi başarılı
    return true;
  } catch (error) {
    safeLog("Veritabanı oluşturma hatası:", error);
    if (client) {
      try {
        await client.end();
      } catch (err) {
        safeLog("Bağlantı kapatma hatası:", err);
      }
    }
    return false;
  }
}

// Script direkt çalıştırıldığında
if (require.main === module) {
  createDatabase().then((success) => {
    if (success) {
      safeLog("Veritabanı başarıyla oluşturuldu.");
      process.exit(0);
    } else {
      safeLog("Veritabanı oluşturulurken hata oluştu.");
      process.exit(1);
    }
  });
} else {
  // Modül olarak başka bir dosya tarafından çağrıldığında
  module.exports = { createDatabase };
}
