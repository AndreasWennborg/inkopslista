# Inköpslistan 🛒

En enkel inköpslista som fungerar direkt i webbläsaren, både på mobil och dator.

## Vad appen gör

- Lägg till varor genom att skriva i fältet och trycka på **Lägg till** eller Enter.
- Bocka av en vara genom att trycka på den. Avbockade varor flyttas längst ner i listan.
- Ta bort en enskild vara med **✕**.
- Ta bort alla avbockade varor på en gång med **Rensa avbockade**.

Listan sparas i webbläsarens `localStorage`, så den finns kvar när du laddar om sidan. Den sparas bara i den webbläsare och på den enhet du använder, och den delas inte med någon annan.

## Kom igång

Appen är vanlig HTML, CSS och JavaScript. Den behöver ingen server, inget byggsteg och inga paket.

- **Lokalt:** öppna `index.html` i en webbläsare.
- **GitHub Pages:** lägg filerna i ett repo, gå till *Settings → Pages* och välj grenen som källa. Alla sökvägar är relativa, så sidan fungerar direkt.

## Filer

| Fil | Innehåll |
| --- | --- |
| `index.html` | Sidans struktur |
| `style.css` | Utseende och responsiv layout |
| `app.js` | Logik och sparande i `localStorage` |
| `favicon.svg` | Ikonen i webbläsarfliken |
