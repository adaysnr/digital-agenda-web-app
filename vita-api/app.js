require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const { createDatabase } = require("./database/setup-database");

const app = express();
const cors = require("cors");
const helmet = require("helmet");

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

// Veritabanı oluşturma ve bağlantı kurma işlemlerini asenkron olarak yap
async function initializeDatabase() {
  try {
    // 1. Önce veritabanını oluştur/kontrol et
    const dbCreated = await createDatabase();

    if (!dbCreated) {
      safeLog("Veritabanı oluşturulamadı.");
      return false;
    }

    safeLog("Veritabanı hazır, Sequelize ile bağlanmaya çalışılıyor...");

    // Veritabanının tam olarak hazır olması için biraz bekle
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 2. Sequelize ile veritabanına bağlan
    const { sequelize } = require("./config/database");

    try {
      // 3. Veritabanı bağlantısını kontrol et
      await sequelize.authenticate();
      safeLog("Veritabanı bağlantısı başarılı!");

      // 4. Tabloları oluştur/kontrol et
      await sequelize.sync();
      safeLog("Veritabanı tabloları başarıyla oluşturuldu.");

      return true;
    } catch (sequelizeError) {
      safeLog("Sequelize hatası:", sequelizeError);
      return false;
    }
  } catch (error) {
    safeLog("Veritabanı başlatma hatası:", error);
    return false;
  }
}

// X-Powered-By başlığını kaldır
app.disable("x-powered-by");

// Helmet ile güvenlik başlıklarını ayarla
app.use(helmet());

// CORS middleware
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Rotaları yükle
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const pomodoroTasksRouter = require("./routes/pomodoroTasks");
const calendarEventsRouter = require("./routes/calendarEvents");
const tasksRouter = require("./routes/tasks");
const notesRouter = require("./routes/notes");
const gmailRouter = require("./routes/gmail");

// Rotaları kullan
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/pomodoroTasks", pomodoroTasksRouter);
app.use("/calendarEvents", calendarEventsRouter);
app.use("/tasks", tasksRouter);
app.use("/notes", notesRouter);
app.use("/gmail", gmailRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// Uygulamayı başlat
async function startApp() {
  safeLog("Uygulama başlatılıyor...");
  safeLog("Veritabanı başlatılıyor...");

  // Önce veritabanını başlat
  const dbInitialized = await initializeDatabase();

  if (dbInitialized) {
    // Sunucuyu başlat - port kullanımda olabilir, alternatif port kullanımı ekleyelim
    let PORT = process.env.PORT || 3001;

    function startServer(port) {
      const server = app
        .listen(port)
        .on("error", (err) => {
          if (err.code === "EADDRINUSE") {
            safeLog(`Port ${port} kullanımda, alternatif port deneniyor...`);
            server.close();
            // Bir sonraki portu dene
            startServer(port + 1);
          } else {
            safeLog("Sunucu başlatma hatası:", err);
            process.exit(1);
          }
        })
        .on("listening", () => {
          safeLog(`Server başarıyla başlatıldı: http://localhost:${port}`);
        });
    }

    // İlk portu dene
    startServer(PORT);
  } else {
    safeLog("Veritabanı başlatılamadığı için sunucu başlatılamadı.");
    process.exit(1);
  }
}

// Uygulamayı başlat
startApp();

module.exports = app;
