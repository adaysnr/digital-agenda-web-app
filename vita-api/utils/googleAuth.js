const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");

// OAuth2 istemcisi oluştur
const createOAuth2Client = () => {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

// Gmail API'sini başlat (servis hesabı ile)
const getGmailClient = () => {
  const oauth2Client = createOAuth2Client();

  // Token bilgilerini ayarla
  const credentials = {
    access_token: process.env.GMAIL_ACCESS_TOKEN,
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    expiry_date: parseInt(process.env.GMAIL_TOKEN_EXPIRY),
  };

  oauth2Client.setCredentials(credentials);

  return google.gmail({ version: "v1", auth: oauth2Client });
};

// Token yenileme işlemi
const refreshToken = async () => {
  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    // Yeni token bilgilerini güncelle
    process.env.GMAIL_ACCESS_TOKEN = credentials.access_token;
    process.env.GMAIL_TOKEN_EXPIRY = credentials.expiry_date;

    return credentials;
  } catch (error) {
    console.error("Token yenileme hatası:", error);
    throw new Error("Gmail token yenileme hatası");
  }
};

// E-posta gönderme fonksiyonu
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const gmailClient = getGmailClient();

    // E-posta içeriği oluştur (MIME formatında)
    const emailContent = [
      "Content-Type: text/html; charset=utf-8",
      "MIME-Version: 1.0",
      `To: ${to}`,
      `From: Vita Dashboard <${process.env.EMAIL_ADDRESS}>`,
      `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
      "",
      htmlContent,
    ].join("\r\n");

    // Base64 formatına dönüştür
    const encodedEmail = Buffer.from(emailContent)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // E-postayı gönder
    try {
      // E-postayı gönder
      const res = await gmailClient.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedEmail,
        },
      });

      return res.data;
    } catch (error) {
      // Token süresi dolmuşsa yenile ve tekrar dene
      if (error.response && error.response.status === 401) {
        await refreshToken();
        const gmailClient = getGmailClient(); // Yeni token ile istemciyi güncelle

        // Tekrar göndermeyi dene
        const res = await gmailClient.users.messages.send({
          userId: "me",
          requestBody: {
            raw: encodedEmail,
          },
        });

        return res.data;
      }

      throw error;
    }
  } catch (error) {
    console.error("E-posta gönderme hatası:", error);
    throw new Error(`E-posta gönderilemedi: ${error.message}`);
  }
};

module.exports = {
  sendEmail,
  createOAuth2Client,
  getGmailClient,
  refreshToken,
};
