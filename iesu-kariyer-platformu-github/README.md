# İESU Kariyer Platformu

Bu paket, İstanbul Esenyurt Üniversitesi Kariyer Merkezi için GitHub'a yüklenebilir statik site yapısıdır.

## Dosya Yapısı

```text
.
├── index.html
├── apps-script/
│   ├── iesu_official_news_bridge_gercek_fotolu.gs
│   ├── iesu_official_career_bridge.gs
│   └── iesu_admin_security_patch.gs
├── legacy/
│   └── uploaded-base.html
├── .github/workflows/pages.yml
├── package.json
└── README.md
```

## Yayına Alma

### GitHub Pages ile

1. GitHub'da yeni bir repository oluşturun.
2. Bu klasördeki dosyaları repository'ye yükleyin.
3. `Settings > Pages` bölümünden GitHub Actions ile yayınlamayı açın.
4. `main` branch'e push edildiğinde site otomatik yayınlanır.

### Komutla yükleme

```bash
git init
git add .
git commit -m "Initial IESU Kariyer Platformu"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git push -u origin main
```

## Lokal Çalıştırma

```bash
npm install
npm run dev
```

Sonra terminalde çıkan yerel adresi açın.

## Yönetici Girişi

Site içinde görünür admin ipucu gösterilmez. Yönetici girişi normal giriş ekranından veya gizli `?admin=1` rotasından yapılabilir.

- Kullanıcı adı: `Kariyer`
- Şifre: proje sahibi tarafından belirlenen mevcut admin şifresi

> Not: GitHub Pages statik yayındır. Gerçek güvenlik için `apps-script/iesu_admin_security_patch.gs` içindeki PropertiesService doğrulaması kullanılmalıdır.

## Apps Script Köprüleri

`apps-script` klasöründeki `.gs` dosyalarını mevcut Google Apps Script projenize ekleyin.

- `iesu_official_news_bridge_gercek_fotolu.gs`: İESU haberleri için görselli canlı haber köprüsü.
- `iesu_official_career_bridge.gs`: Kariyer merkezi resmi içerik/kaynak köprüsü.
- `iesu_admin_security_patch.gs`: Admin kullanıcı/şifre doğrulamasını Script Properties tarafına taşıma örneği.

## Birleştirme Notu

`index.html`, son admin giriş düzeltmeleri, firma/öğrenci/mezun panel erişimi, İESU haber akışı ve kariyer içerikleri birleştirilmiş ana dosyadır. `legacy/uploaded-base.html` ise yüklenen kaynak dosyanın bozulmamış yedeğidir.
