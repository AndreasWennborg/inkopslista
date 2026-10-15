// Kategorier i ungefär den ordning man går genom en butik.
// "vanliga" visas som förslag när man skriver, och "ord" är nyckelord
// som används för att gissa kategori utifrån varans namn.
(function () {
  "use strict";

  var KATEGORIER = [
    {
      id: "frukt",
      namn: "Frukt & grönt",
      ikon: "🍎",
      vanliga: [
        "Äpplen", "Bananer", "Apelsiner", "Citroner", "Lime", "Päron", "Vindruvor",
        "Jordgubbar", "Hallon", "Blåbär", "Melon", "Kiwi", "Mango", "Avokado", "Tomater",
        "Körsbärstomater", "Gurka", "Sallad", "Paprika", "Gul lök", "Rödlök", "Vitlök",
        "Potatis", "Sötpotatis", "Morötter", "Broccoli", "Blomkål", "Spenat", "Champinjoner",
        "Zucchini", "Purjolök", "Ingefära", "Färsk basilika"
      ],
      ord: [
        "frukt", "grönsak", "äpple", "äpplen", "banan", "apelsin", "citron", "lime", "päron",
        "druv", "jordgubb", "hallon", "blåbär", "lingon", "bär", "melon", "kiwi", "mango",
        "ananas", "avokado", "plommon", "persika", "nektarin", "clementin", "mandarin",
        "tomat", "gurka", "sallad", "ruccola", "paprika", "lök", "vitlök", "purjo", "potatis",
        "morot", "morötter", "broccoli", "blomkål", "kål", "spenat", "svamp", "champinjon",
        "zucchini", "squash", "selleri", "rödbet", "rädis", "majskolv", "persilja", "dill",
        "basilika", "koriander", "ingefära", "chili"
      ]
    },
    {
      id: "brod",
      namn: "Bröd",
      ikon: "🍞",
      vanliga: [
        "Bröd", "Rågbröd", "Limpa", "Baguette", "Frallor", "Knäckebröd", "Kanelbullar",
        "Tortillabröd", "Hamburgerbröd", "Korvbröd", "Skorpor", "Croissanter"
      ],
      ord: [
        "bröd", "limpa", "baguette", "fralla", "frallor", "bulle", "bullar", "knäcke",
        "croissant", "tortilla", "skorpor", "toast", "tårta", "kaka", "wienerbröd", "pitabröd"
      ]
    },
    {
      id: "mejeri",
      namn: "Mejeri & ägg",
      ikon: "🧀",
      vanliga: [
        "Mjölk", "Mellanmjölk", "Lättmjölk", "Filmjölk", "Yoghurt", "Grädde",
        "Matlagningsgrädde", "Gräddfil", "Crème fraiche", "Smör", "Bregott", "Ost",
        "Riven ost", "Mozzarella", "Fetaost", "Halloumi", "Keso", "Kvarg", "Ägg", "Havredryck"
      ],
      ord: [
        "mjölk", "filmjölk", "fil", "yoghurt", "grädde", "gräddfil", "crème fraiche",
        "creme fraiche", "smör", "margarin", "bregott", "ost", "kvarg", "keso", "kesella",
        "ägg", "havredryck", "mjölkdryck", "mozzarella", "halloumi", "feta"
      ]
    },
    {
      id: "kott",
      namn: "Kött & fisk",
      ikon: "🥩",
      vanliga: [
        "Köttfärs", "Kycklingfilé", "Kycklinglår", "Bacon", "Falukorv", "Prinskorv", "Korv",
        "Skinka", "Salami", "Fläskfilé", "Köttbullar", "Lax", "Torsk", "Räkor", "Sill"
      ],
      ord: [
        "kött", "köttfärs", "färs", "kyckling", "kalkon", "fläsk", "kotlett", "bacon",
        "korv", "falukorv", "prinskorv", "skinka", "salami", "pålägg", "biff", "entrecote",
        "oxfilé", "lamm", "köttbullar", "fisk", "lax", "torsk", "sej", "räkor", "sill"
      ]
    },
    {
      id: "skafferi",
      namn: "Skafferi",
      ikon: "🥫",
      vanliga: [
        "Pasta", "Spaghetti", "Makaroner", "Ris", "Nudlar", "Vetemjöl", "Socker", "Salt",
        "Svartpeppar", "Olivolja", "Rapsolja", "Ketchup", "Senap", "Majonnäs",
        "Buljongtärningar", "Krossade tomater", "Tomatpuré", "Kokosmjölk", "Bönor", "Linser",
        "Kikärtor", "Havregryn", "Müsli", "Flingor", "Sylt", "Honung", "Kaffe", "Te", "Kakao",
        "Nötter", "Russin", "Tonfisk", "Sojasås", "Tacokrydda", "Tacosås", "Jäst", "Bakpulver",
        "Majs"
      ],
      ord: [
        "pasta", "spaghetti", "makaroner", "nudlar", "ris", "mjöl", "vetemjöl", "socker",
        "salt", "peppar", "krydd", "olja", "olivolja", "vinäger", "ketchup", "senap",
        "majonnäs", "buljong", "fond", "konserv", "krossade tomater", "tomatpuré", "bönor",
        "linser", "kikärtor", "havregryn", "gryn", "flingor", "müsli", "sylt", "honung",
        "kaffe", "te", "tepåsar", "kakao", "nötter", "mandlar", "russin", "äppelmos",
        "tonfisk", "kokosmjölk", "soja", "tacokrydda", "tacosås", "jäst", "bakpulver", "ströbröd", "majs"
      ]
    },
    {
      id: "fryst",
      namn: "Fryst",
      ikon: "🧊",
      vanliga: [
        "Glass", "Frysta ärtor", "Frysta bär", "Fiskpinnar", "Pizza", "Pommes frites",
        "Frysta grönsaker", "Isbitar"
      ],
      ord: ["fryst", "frysta", "frysta grönsaker", "frysgrönsaker", "glass", "pizza", "fiskpinnar", "pommes", "isbitar"]
    },
    {
      id: "dryck",
      namn: "Dryck",
      ikon: "🥤",
      vanliga: [
        "Juice", "Apelsinjuice", "Läsk", "Mineralvatten", "Saft", "Öl", "Vin", "Cider"
      ],
      ord: [
        "juice", "apelsinjuice", "läsk", "cola", "vatten", "mineralvatten", "sodavatten", "saft", "öl",
        "vin", "cider", "smoothie", "energidryck"
      ]
    },
    {
      id: "godis",
      namn: "Godis & snacks",
      ikon: "🍫",
      vanliga: [
        "Godis", "Choklad", "Chips", "Ostbågar", "Popcorn", "Kex", "Kakor", "Lakrits",
        "Tuggummi", "Dipp"
      ],
      ord: [
        "godis", "choklad", "chips", "ostbågar", "popcorn", "kex", "kakor", "lakrits",
        "tuggummi", "snacks", "dipp", "nötmix"
      ]
    },
    {
      id: "hushall",
      namn: "Hushåll",
      ikon: "🧻",
      vanliga: [
        "Toalettpapper", "Hushållspapper", "Diskmedel", "Disktabletter", "Tvättmedel",
        "Sköljmedel", "Soppåsar", "Fryspåsar", "Plastfolie", "Aluminiumfolie",
        "Bakplåtspapper", "Servetter", "Batterier", "Tändstickor", "Värmeljus"
      ],
      ord: [
        "toapapper", "toalettpapper", "hushållspapper", "diskmedel", "disktabletter",
        "diskborste", "tvättmedel", "sköljmedel", "soppåsar", "fryspåsar", "påsar",
        "plastfolie", "aluminiumfolie", "folie", "bakplåtspapper", "servetter", "batterier",
        "glödlampa", "tändstickor", "värmeljus", "stearinljus", "wettex", "rengöring"
      ]
    },
    {
      id: "hygien",
      namn: "Hygien & apotek",
      ikon: "🧴",
      vanliga: [
        "Tandkräm", "Tandborste", "Schampo", "Balsam", "Tvål", "Duschtvål", "Deodorant",
        "Rakhyvlar", "Bomullspads", "Tops", "Plåster", "Solkräm", "Handkräm", "Blöjor",
        "Alvedon"
      ],
      ord: [
        "tandkräm", "tandborste", "schampo", "balsam", "tvål", "duschtvål", "deodorant",
        "deo", "rakhyv", "bomull", "tops", "plåster", "bindor", "tamponger", "blöjor",
        "solkräm", "hudkräm", "handkräm", "alvedon", "ipren", "värktabletter"
      ]
    },
    {
      id: "ovrigt",
      namn: "Övrigt",
      ikon: "🛒",
      vanliga: [],
      ord: []
    }
  ];

  var STANDARD = "ovrigt";

  // Korta ord (max 3 tecken, t.ex. "ost", "te", "ris") räknas bara i början eller
  // slutet av ett ord, så att "te" inte matchar "tomater". Längsta träffen vinner,
  // så "äppelmos" hamnar i skafferiet och inte bland frukten.
  function matchar(text, ord) {
    if (ord.length > 3) return text.indexOf(ord) !== -1;
    var orden = text.split(/[^a-zåäöéü]+/);
    return orden.some(function (w) {
      return w.slice(0, ord.length) === ord || w.slice(-ord.length) === ord;
    });
  }

  function gissaKategori(namn) {
    var text = String(namn).toLowerCase();
    var basta = STANDARD;
    var bastaLangd = 0;
    KATEGORIER.forEach(function (kat) {
      kat.ord.forEach(function (ord) {
        if (ord.length > bastaLangd && matchar(text, ord)) {
          basta = kat.id;
          bastaLangd = ord.length;
        }
      });
    });
    return basta;
  }

  function finnsKategori(id) {
    return KATEGORIER.some(function (k) { return k.id === id; });
  }

  window.Kategorier = {
    lista: KATEGORIER,
    standard: STANDARD,
    gissa: gissaKategori,
    finns: finnsKategori
  };
})();
