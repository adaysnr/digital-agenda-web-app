/**
 * Gmail API için OAuth2 token oluşturma ve yenileme scripti
 * Bu script, Gmail API ile entegrasyon için gerekli access ve refresh tokenları oluşturur
 *
 * Kullanım:
 * 1. .env dosyasında GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET ve GOOGLE_REDIRECT_URI değerlerini ayarlayın
 * 2. Bu scripti çalıştırın: node utils/generateGmailToken.js
 * 3. Konsolda verilen URL'yi tarayıcıda açın ve Google hesabınızla giriş yapın
 * 4. Gelen yetkilendirme kodunu konsola girin
 * 5. Oluşturulan token bilgilerini .env dosyanıza ekleyin
 */

require("dotenv").config();
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

// Güvenli loglama fonksiyonu
function safeLog(message, error, sensitiveData = false) {
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

// Gerekli ortam değişkenlerinin kontrolü
const requiredEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REDIRECT_URI",
];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    "\x1b[31m%s\x1b[0m",
    "Hata: Aşağıdaki ortam değişkenleri .env dosyasında tanımlanmamış:"
  );
  missingVars.forEach((varName) => console.error(`- ${varName}`));
  console.error(
    "\nLütfen .env dosyasını düzenleyerek gerekli değerleri ekleyin ve tekrar deneyin."
  );
  process.exit(1);
}

// OAuth2 istemcisi oluştur
const createOAuth2Client = () => {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

// Kullanıcı giriş için readline arayüzü
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Ana token oluşturma fonksiyonu
async function generateTokens() {
  try {
    const oauth2Client = createOAuth2Client();

    // Gmail API için gerekli izinler
    const scopes = [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.compose",
      "https://www.googleapis.com/auth/gmail.modify",
    ];

    // Yetkilendirme URL'si oluştur
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent", // Her zaman refresh token almak için onay ekranını göster
    }); // Kullanıcıya yetkilendirme URL'sini göster
    safeLog("\n\x1b[36m%s\x1b[0m", "1. Aşama: Google Hesap Yetkilendirmesi");
    safeLog(
      "\nAşağıdaki URL'yi tarayıcınızda açın ve Google hesabınızla giriş yaparak izinleri onaylayın:"
    );
    safeLog("\x1b[33m%s\x1b[0m", authUrl);
    safeLog("\nYetkilendirmeden sonra alacağınız kodu buraya yapıştırın:");

    // Kullanıcıdan yetkilendirme kodunu al
    rl.question("Yetkilendirme kodu: ", async (code) => {
      try {
        // Kodu kullanarak token al
        const { tokens } = await oauth2Client.getToken(code); // Token bilgilerini göster
        safeLog("\n\x1b[36m%s\x1b[0m", "2. Aşama: Token Bilgileri");
        safeLog("\n\x1b[32m%s\x1b[0m", "Tokenlar başarıyla oluşturuldu!");
        safeLog("\nLütfen aşağıdaki değerleri .env dosyanıza ekleyin:");
        console.log(
          "\x1b[33m%s\x1b[0m",
          `GMAIL_ACCESS_TOKEN=********(güvenlik için gizlendi)`
        );
        console.log(
          "\x1b[33m%s\x1b[0m",
          `GMAIL_REFRESH_TOKEN=********(güvenlik için gizlendi)`
        );
        console.log(
          "\x1b[33m%s\x1b[0m",
          `GMAIL_TOKEN_EXPIRY=${tokens.expiry_date}`
        );

        // .env dosyasını otomatik güncelleme seçeneği
        rl.question(
          "\n.env dosyanızı otomatik olarak güncellemek ister misiniz? (E/H): ",
          (answer) => {
            if (answer.toLowerCase() === "e") {
              updateEnvFile(tokens);
            } else {
              safeLog(
                "\nTokenları .env dosyanıza manuel olarak eklemeyi unutmayın!"
              );
            }
            rl.close();
            safeLog(
              "\n\x1b[36m%s\x1b[0m",
              "İşlem tamamlandı. Gmail API entegrasyonu için tokenlar hazır."
            );
          }
        );
      } catch (error) {
        safeLog("\n\x1b[31m%s\x1b[0m", "Token alınırken hata oluştu:", error);
        rl.close();
      }
    });
  } catch (error) {
    safeLog("\n\x1b[31m%s\x1b[0m", "İşlem sırasında bir hata oluştu:", error);
    rl.close();
  }
}

// .env dosyasını güncelleme fonksiyonu
function updateEnvFile(tokens) {
  try {
    const envPath = path.resolve(__dirname, "../.env");

    // .env dosyasını oku
    let envContent = fs.readFileSync(envPath, "utf8");

    // Token değerlerini güncelle veya ekle
    const envVars = {
      GMAIL_ACCESS_TOKEN: tokens.access_token,
      GMAIL_REFRESH_TOKEN: tokens.refresh_token,
      GMAIL_TOKEN_EXPIRY: tokens.expiry_date,
    };

    // Her değişken için .env dosyasını güncelle
    Object.entries(envVars).forEach(([key, value]) => {
      // Değişken zaten varsa güncelle, yoksa ekle
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    }); // Güncellenmiş içeriği .env dosyasına yaz
    fs.writeFileSync(envPath, envContent);
    safeLog("\n\x1b[32m%s\x1b[0m", ".env dosyası başarıyla güncellendi!");
  } catch (error) {
    safeLog(
      "\n\x1b[31m%s\x1b[0m",
      ".env dosyası güncellenirken hata oluştu:",
      error
    );
    safeLog("Lütfen token değerlerini manuel olarak .env dosyanıza ekleyin.");
  }
}

// Scripti çalıştır
safeLog("\x1b[36m%s\x1b[0m", "=== Gmail API Token Oluşturma Aracı ===");
safeLog(
  "\nBu araç, Gmail API entegrasyonu için gerekli token'ları oluşturacak."
);
safeLog(
  "Devam etmek için aşağıdaki bilgilerin .env dosyanızda doğru yapılandırıldığından emin olun:"
);
safeLog("- GOOGLE_CLIENT_ID");
safeLog("- GOOGLE_CLIENT_SECRET");
console.log(
  "- GOOGLE_REDIRECT_URI (genellikle https://developers.google.com/oauthplayground)"
);

// İşlemi başlat
generateTokens();
