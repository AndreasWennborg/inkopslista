# Inköpslistan 🛒

En enkel inköpslista som fungerar direkt i webbläsaren, både på mobil och dator.

## Vad appen gör

- Lägg till varor genom att skriva i fältet och trycka på **Lägg till** eller Enter.
- Medan du skriver visas förslag från varor du lagt till tidigare och från en lista med vanliga varor. Tryck på ett förslag, eller välj med piltangenterna och Enter, så läggs varan till direkt med rätt kategori.
- Varorna grupperas efter kategori, till exempel frukt & grönt, mejeri och bröd, och sorteras alfabetiskt inom varje grupp. Kategorin gissas utifrån varans namn, men du kan också välja den själv i listan under fältet. Hamnar en vara fel trycker du på kategoriikonen på raden och väljer en annan.
- Bocka av en vara genom att trycka på den. Avbockade varor samlas i gruppen **Avbockat** längst ner.
- Ta bort en enskild vara med **✕**.
- Ta bort alla avbockade varor på en gång med **Rensa avbockade**. Du får bekräfta innan något tas bort.
- Små ljud spelas när du lägger till, bockar av och rensar. Ljudet stängs av och slås på med 🔊-knappen.

Listan, historiken för förslagen och ljudinställningen sparas i webbläsarens `localStorage`, så den finns kvar när du laddar om sidan. Den sparas bara i den webbläsare och på den enhet du använder, och den delas inte med någon annan.

## Kom igång

Appen är vanlig HTML, CSS och JavaScript. Den behöver ingen server, inget byggsteg och inga paket.

- **Lokalt:** öppna `index.html` i en webbläsare.
- **GitHub Pages:** lägg filerna i ett repo, gå till *Settings → Pages* och välj grenen som källa. Alla sökvägar är relativa, så sidan fungerar direkt.

## Filer

| Fil | Innehåll |
| --- | --- |
| `index.html` | Sidans struktur |
| `style.css` | Utseende och responsiv layout |
| `app.js` | Logik, ljud och sparande i `localStorage` |
| `kategorier.js` | Kategorier, vanliga varor och nyckelord för att gissa kategori |
| `forslag.js` | Förslag medan du skriver, och historik över tidigare varor |
| `favicon.svg` | Ikonen i webbläsarfliken |
