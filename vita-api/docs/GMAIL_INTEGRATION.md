# Gmail API SMTP Entegrasyonu

Bu dökümantasyon, Vita Dashboard uygulamasında Gmail API'nin SMTP servisi gibi kullanılması için gerekli adımları içerir.

## Gerekli Paketler

Aşağıdaki Node.js paketleri gereklidir:

```bash
npm install googleapis google-auth-library
```

## Google Cloud Console Ayarları

1. [Google Cloud Console](https://console.cloud.google.com/)'a gidin
2. Yeni bir proje oluşturun veya mevcut bir projeyi seçin
3. "API ve Servisler" > "Kütüphane" kısmına gidin
4. "Gmail API"yi arayın ve etkinleştirin
5. "API ve Servisler" > "Kimlik Bilgileri" kısmına gidin
6. "Kimlik Bilgileri Oluştur" > "OAuth istemci kimliği" seçin
7. Uygulama türü olarak "Web uygulaması" seçin
8. Yönlendirme URI'leri olarak aşağıdakini ekleyin:
   - `https://developers.google.com/oauthplayground`
9. "Oluştur" butonuna tıklayın
10. Client ID ve Client Secret değerlerini not alın
11. OAuth onay ekranını yapılandırın ve test kullanıcılarını ekleyin (geliştirme aşamasında)

## OAuth2 Token Alma

1. `.env.example` dosyasından kopyalayarak bir `.env` dosyası oluşturun
2. `.env` dosyasındaki aşağıdaki değerleri doldurun:

   - `EMAIL_ADDRESS`: Gmail adresiniz
   - `GOOGLE_CLIENT_ID`: Google Cloud Console'dan aldığınız Client ID
   - `GOOGLE_CLIENT_SECRET`: Google Cloud Console'dan aldığınız Client Secret
   - `GOOGLE_REDIRECT_URI`: `https://developers.google.com/oauthplayground`

3. Token oluşturma scriptini çalıştırın (bu script yoksa oluşturun):

   ```bash
   node utils/generateGmailToken.js
   ```

4. Alternatif olarak, tokenları manuel olarak oluşturmak için:
   - [Google OAuth Playground](https://developers.google.com/oauthplayground/)'a gidin
   - Sağ üst köşedeki dişli simgesine tıklayın ve "Use your own OAuth credentials"i işaretleyin
   - Client ID ve Client Secret bilgilerinizi girin
   - Sol tarafta "Gmail API v1" altındaki "https://mail.google.com/" iznini seçin
   - "Authorize APIs" butonuna tıklayın
   - İzin verin ve "Exchange authorization code for tokens" butonuna tıklayın
   - Alınan Access Token, Refresh Token ve Expiry değerlerini `.env` dosyanıza kaydedin:
     - `GMAIL_ACCESS_TOKEN`
     - `GMAIL_REFRESH_TOKEN`
     - `GMAIL_TOKEN_EXPIRY`

## Kullanım

### E-posta Gönderme

```javascript
const { sendEmail } = require("../utils/googleAuth");

await sendEmail(
  "alici@ornek.com",
  "E-posta Konusu",
  "<p>HTML formatında içerik</p>"
);
```

### Vita Dashboard'da Kullanım

Vita Dashboard uygulamasında Gmail API entegrasyonu şu amaçlarla kullanılmaktadır:

1. **Parola Sıfırlama E-postaları**: Kullanıcılar şifrelerini unuttuklarında, parola sıfırlama linkini içeren e-postalar gönderilir.
2. **Sistem Bildirimleri**: Gerektiğinde sistem ile ilgili önemli bildirimler gönderilebilir.

### Sorun Giderme

E-posta gönderilememesi durumunda kontrol edilmesi gerekenler:

1. Token geçerlilik süresi dolmuş olabilir - yeni token alın
2. Gmail API izinleri doğru yapılandırılmamış olabilir
3. Google hesabı güvenlik ayarlarında sorun olabilir
4. `.env` dosyasındaki tüm değerlerin doğru olduğundan emin olun
5. Google Cloud Console'da API'nin etkin olduğundan emin olun

## Token Yenileme

Tokenlar süresi dolduğunda otomatik olarak yenilenecek şekilde yapılandırılmıştır. Ancak, sürecin başarısız olması durumunda, manuel olarak token almak için yukarıdaki "OAuth2 Token Alma" adımlarını tekrarlayabilirsiniz.

## Önemli Notlar

- Token değerleri hassas bilgilerdir ve güvenli bir şekilde saklanmalıdır.
- `.env` dosyasını kesinlikle versiyon kontrol sistemine (git) eklemeyiniz.
- Google'ın API kullanım limitlerini aşmamaya dikkat edin.

## Faydalı Kaynaklar

- [Gmail API Referansı](https://developers.google.com/gmail/api/reference/rest)
- [Google OAuth 2.0 Dokümanı](https://developers.google.com/identity/protocols/oauth2)
- [Google OAuth Playground](https://developers.google.com/oauthplayground/)
  | ------------------------------------ | ----- | ------------------------------------- |
  | `/gmail/test` | GET | Gmail API bağlantısını test eder |
  | `/gmail/send-email` | POST | Basit e-posta gönderir |
  | `/gmail/send-email-with-attachments` | POST | Ekli dosya ile e-posta gönderir |
  | `/gmail/send-email-with-copies` | POST | CC ve BCC alıcılarla e-posta gönderir |

## Güvenlik Notları

- Token'lar hassas bilgilerdir, güvenli bir şekilde saklanmalıdır
- `.env` dosyası git reposuna eklenmemelidir
- Üretim ortamında daha güvenli bir token saklama mekanizması kullanılması önerilir
- Google Cloud Console'da OAuth onay ekranında gerekli bilgileri doldurun
