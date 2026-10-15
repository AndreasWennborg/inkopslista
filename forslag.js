// Förslag (autocomplete) i fältet för ny vara.
// Förslagen kommer från varor man lagt till tidigare och från en lista med vanliga varor.
(function () {
  "use strict";

  var HISTORY_KEY = "inkopslista.historik";
  var MAX_HISTORY = 300;
  var MAX_SUGGESTIONS = 6;

  // Historik: { "mjölk": { namn: "Mjölk", kategori: "mejeri", antal: 3 } }
  var history = loadHistory();

  function loadHistory() {
    try {
      var data = JSON.parse(localStorage.getItem(HISTORY_KEY));
      return data && typeof data === "object" && !Array.isArray(data) ? data : {};
    } catch (e) {
      return {};
    }
  }

  function saveHistory() {
    var keys = Object.keys(history);
    if (keys.length > MAX_HISTORY) {
      // Behåll de mest använda varorna.
      keys.sort(function (a, b) { return history[b].antal - history[a].antal; });
      keys.slice(MAX_HISTORY).forEach(function (k) { delete history[k]; });
    }
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {}
  }

  function remember(namn, kategori) {
    var key = namn.toLowerCase();
    var entry = history[key] || { namn: namn, kategori: kategori, antal: 0 };
    entry.namn = namn;
    entry.kategori = kategori;
    entry.antal += 1;
    history[key] = entry;
    saveHistory();
  }

  function updateCategory(namn, kategori) {
    var entry = history[namn.toLowerCase()];
    if (!entry) return;
    entry.kategori = kategori;
    saveHistory();
  }

  function allCandidates() {
    var seen = {};
    var list = [];
    Object.keys(history).forEach(function (key) {
      var h = history[key];
      if (!Kategorier.finns(h.kategori)) return;
      seen[key] = true;
      list.push({ namn: h.namn, kategori: h.kategori, antal: h.antal });
    });
    Kategorier.lista.forEach(function (kat) {
      kat.vanliga.forEach(function (namn) {
        var key = namn.toLowerCase();
        if (seen[key]) return;
        seen[key] = true;
        list.push({ namn: namn, kategori: kat.id, antal: 0 });
      });
    });
    return list;
  }

  // 0 = namnet börjar med texten, 1 = ett ord i namnet gör det,
  // 2 = texten finns någonstans i namnet (bara från 3 tecken). -1 = ingen träff.
  function rank(namn, query) {
    var text = namn.toLowerCase();
    if (text.indexOf(query) === 0) return 0;
    var words = text.split(/\s+/);
    for (var i = 1; i < words.length; i++) {
      if (words[i].indexOf(query) === 0) return 1;
    }
    if (query.length >= 3 && text.indexOf(query) !== -1) return 2;
    return -1;
  }

  function find(query, excludeNames, sorter) {
    var q = query.trim().toLowerCase();
    if (!q) return [];
    var exclude = {};
    excludeNames.forEach(function (n) { exclude[n.toLowerCase()] = true; });

    return allCandidates()
      .map(function (c) { c.rank = rank(c.namn, q); return c; })
      .filter(function (c) {
        return c.rank >= 0 && !exclude[c.namn.toLowerCase()] && c.namn.toLowerCase() !== q;
      })
      .sort(function (a, b) {
        return a.rank - b.rank || b.antal - a.antal || sorter.compare(a.namn, b.namn);
      })
      .slice(0, MAX_SUGGESTIONS);
  }

  // Kopplar förslagslistan till ett textfält.
  // options: { input, listbox, getExcluded(), onChoose(forslag), sorter }
  function attach(options) {
    var input = options.input;
    var listbox = options.listbox;
    var current = [];
    var active = -1;

    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", listbox.id);

    function close() {
      current = [];
      active = -1;
      listbox.hidden = true;
      listbox.textContent = "";
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
    }

    function highlight(index) {
      active = index;
      var items = listbox.children;
      for (var i = 0; i < items.length; i++) {
        items[i].setAttribute("aria-selected", i === active ? "true" : "false");
      }
      if (active >= 0) {
        input.setAttribute("aria-activedescendant", items[active].id);
      } else {
        input.removeAttribute("aria-activedescendant");
      }
    }

    function choose(index) {
      var forslag = current[index];
      close();
      if (forslag) options.onChoose(forslag);
    }

    function renderName(namn, query) {
      var frag = document.createDocumentFragment();
      var i = namn.toLowerCase().indexOf(query);
      if (i < 0) {
        frag.appendChild(document.createTextNode(namn));
        return frag;
      }
      frag.appendChild(document.createTextNode(namn.slice(0, i)));
      var strong = document.createElement("strong");
      strong.textContent = namn.slice(i, i + query.length);
      frag.appendChild(strong);
      frag.appendChild(document.createTextNode(namn.slice(i + query.length)));
      return frag;
    }

    function open() {
      var query = input.value.trim().toLowerCase();
      current = find(input.value, options.getExcluded(), options.sorter);
      active = -1;
      listbox.textContent = "";
      if (current.length === 0) {
        close();
        return;
      }

      current.forEach(function (forslag, index) {
        var kat = Kategorier.lista.filter(function (k) { return k.id === forslag.kategori; })[0];
        var li = document.createElement("li");
        li.id = listbox.id + "-" + index;
        li.className = "suggestion";
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", "false");

        var icon = document.createElement("span");
        icon.className = "suggestion-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = kat.ikon;

        var name = document.createElement("span");
        name.className = "suggestion-name";
        name.appendChild(renderName(forslag.namn, query));

        var category = document.createElement("span");
        category.className = "suggestion-category";
        category.textContent = kat.namn;

        li.appendChild(icon);
        li.appendChild(name);
        li.appendChild(category);

        // pointerdown + preventDefault behåller fokus (och tangentbordet på mobil) i fältet.
        li.addEventListener("pointerdown", function (event) {
          event.preventDefault();
        });
        li.addEventListener("click", function () {
          choose(index);
        });
        li.addEventListener("pointermove", function () {
          if (active !== index) highlight(index);
        });

        listbox.appendChild(li);
      });

      listbox.hidden = false;
      input.setAttribute("aria-expanded", "true");
    }

    input.addEventListener("input", open);

    input.addEventListener("keydown", function (event) {
      if (listbox.hidden) {
        if (event.key === "ArrowDown" && input.value.trim()) {
          open();
          if (current.length) highlight(0);
          event.preventDefault();
        }
        return;
      }
      if (event.key === "ArrowDown") {
        highlight((active + 1) % current.length);
        event.preventDefault();
      } else if (event.key === "ArrowUp") {
        highlight(active <= 0 ? current.length - 1 : active - 1);
        event.preventDefault();
      } else if (event.key === "Enter" && active >= 0) {
        choose(active);
        event.preventDefault();
      } else if (event.key === "Escape") {
        close();
        event.preventDefault();
      }
    });

    input.addEventListener("blur", close);

    return { close: close };
  }

  window.Forslag = {
    remember: remember,
    updateCategory: updateCategory,
    find: find,
    attach: attach
  };
})();
