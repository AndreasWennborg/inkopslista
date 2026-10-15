(function () {
  "use strict";

  var STORAGE_KEY = "inkopslista.varor";

  var form = document.getElementById("add-form");
  var input = document.getElementById("item-input");
  var list = document.getElementById("list");
  var empty = document.getElementById("empty");
  var summary = document.getElementById("summary");
  var clearDoneBtn = document.getElementById("clear-done");

  var categorySelect = document.getElementById("category-select");
  var sorter = window.Intl && Intl.Collator
    ? new Intl.Collator("sv", { sensitivity: "base", numeric: true })
    : { compare: function (a, b) { return a.localeCompare(b, "sv"); } };

  var items = load();
  var justAddedId = null;

  function load() {
    var data;
    try {
      data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      data = null;
    }
    if (!Array.isArray(data)) return [];
    // Varor sparade innan kategorier fanns får en gissad kategori.
    data.forEach(function (item) {
      if (!Kategorier.finns(item.kategori)) item.kategori = Kategorier.gissa(item.namn);
    });
    return data;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // Sparandet misslyckades (t.ex. privat läge), listan fungerar ändå tills sidan laddas om.
    }
  }

  // Ljud skapas med Web Audio, så inga ljudfiler behövs.
  var SOUND_KEY = "inkopslista.ljudAv";
  var soundToggle = document.getElementById("sound-toggle");
  var audioCtx = null;
  var muted = false;

  try {
    muted = localStorage.getItem(SOUND_KEY) === "1";
  } catch (e) {}

  function renderSoundToggle() {
    var label = muted ? "Slå på ljud" : "Stäng av ljud";
    soundToggle.textContent = muted ? "🔇" : "🔊";
    soundToggle.classList.toggle("is-muted", muted);
    soundToggle.setAttribute("aria-label", label);
    soundToggle.title = label;
  }

  soundToggle.addEventListener("click", function () {
    muted = !muted;
    try {
      localStorage.setItem(SOUND_KEY, muted ? "1" : "0");
    } catch (e) {}
    renderSoundToggle();
  });

  renderSoundToggle();

  function getAudio() {
    if (muted) return null;
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function tone(ctx, freq, start, duration, type, volume) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    var t = ctx.currentTime + start;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  // Kort "blipp" uppåt när en vara läggs till.
  function playAddSound() {
    try {
      var ctx = getAudio();
      if (!ctx) return;
      tone(ctx, 523, 0, 0.12, "sine", 0.25);
      tone(ctx, 784, 0.08, 0.16, "sine", 0.25);
    } catch (e) {}
  }

  // Glad liten klockslinga när en vara bockas av.
  function playDoneSound() {
    try {
      var ctx = getAudio();
      if (!ctx) return;
      tone(ctx, 659, 0, 0.25, "triangle", 0.2);
      tone(ctx, 784, 0.07, 0.25, "triangle", 0.2);
      tone(ctx, 1047, 0.14, 0.4, "triangle", 0.2);
    } catch (e) {}
  }

  // Nedåtgående "svisch" när avbockade varor rensas bort.
  function playClearSound() {
    try {
      var ctx = getAudio();
      if (!ctx) return;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      var t = ctx.currentTime;
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(900, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.35);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
      tone(ctx, 196, 0.32, 0.2, "sine", 0.25);
    } catch (e) {}
  }

  function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function addItem(name, kategori) {
    justAddedId = newId();
    if (!Kategorier.finns(kategori)) kategori = Kategorier.gissa(name);
    items.push({ id: justAddedId, namn: name, kategori: kategori, klar: false });
    Forslag.remember(name, kategori);
    update();
    justAddedId = null;
    playAddSound();
  }

  function toggleItem(id) {
    items.forEach(function (item) {
      if (item.id === id) {
        item.klar = !item.klar;
        if (item.klar) playDoneSound();
      }
    });
    update();
  }

  function moveItem(id, kategori) {
    if (!Kategorier.finns(kategori)) return;
    items.forEach(function (item) {
      if (item.id === id) {
        item.kategori = kategori;
        Forslag.updateCategory(item.namn, kategori);
      }
    });
    update();
  }

  function deleteItem(id) {
    items = items.filter(function (item) { return item.id !== id; });
    update();
  }

  function clearDone() {
    items = items.filter(function (item) { return !item.klar; });
    update();
    playClearSound();
  }

  function update() {
    save();
    render();
  }

  function byName(a, b) {
    return sorter.compare(a.namn, b.namn);
  }

  function render() {
    list.textContent = "";

    // Ej avbockade varor grupperas per kategori, i butiksordning.
    Kategorier.lista.forEach(function (kat) {
      var groupItems = items.filter(function (i) {
        return !i.klar && i.kategori === kat.id;
      });
      if (groupItems.length > 0) {
        list.appendChild(createGroupElement(kat.ikon, kat.namn, groupItems.sort(byName), ""));
      }
    });

    // Avbockade varor samlas i en egen grupp längst ner.
    var doneItems = items.filter(function (i) { return i.klar; });
    if (doneItems.length > 0) {
      list.appendChild(createGroupElement("✅", "Avbockat", doneItems.sort(byName), "group-done"));
    }

    var doneCount = items.length - items.filter(function (i) { return !i.klar; }).length;
    var leftCount = items.length - doneCount;

    empty.hidden = items.length > 0;
    clearDoneBtn.disabled = doneCount === 0;
    clearDoneBtn.textContent = doneCount > 0
      ? "Rensa avbockade (" + doneCount + ")"
      : "Rensa avbockade";

    if (items.length === 0) {
      summary.textContent = "";
    } else if (leftCount === 0) {
      summary.textContent = "Allt är handlat! 🎉";
    } else {
      summary.textContent = leftCount === 1
        ? "1 vara kvar att handla"
        : leftCount + " varor kvar att handla";
    }
  }

  function createGroupElement(ikon, namn, groupItems, extraClass) {
    var section = document.createElement("section");
    section.className = "group" + (extraClass ? " " + extraClass : "");

    var title = document.createElement("h2");
    title.className = "group-title";

    var icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = ikon;

    var text = document.createElement("span");
    text.textContent = namn;

    var count = document.createElement("span");
    count.className = "group-count";
    count.textContent = groupItems.length;
    count.setAttribute("aria-label", groupItems.length === 1 ? "1 vara" : groupItems.length + " varor");

    title.appendChild(icon);
    title.appendChild(text);
    title.appendChild(count);

    var ul = document.createElement("ul");
    ul.className = "list";
    groupItems.forEach(function (item) {
      ul.appendChild(createItemElement(item));
    });

    section.appendChild(title);
    section.appendChild(ul);
    return section;
  }

  function createItemElement(item) {
    var li = document.createElement("li");
    li.className = "item" + (item.klar ? " done" : "") + (item.id === justAddedId ? " new" : "");

    var label = document.createElement("label");

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.klar;
    checkbox.addEventListener("change", function () {
      toggleItem(item.id);
    });

    var name = document.createElement("span");
    name.className = "item-name";
    name.textContent = item.namn;

    label.appendChild(checkbox);
    label.appendChild(name);

    var del = document.createElement("button");
    del.type = "button";
    del.className = "delete";
    del.textContent = "✕";
    del.setAttribute("aria-label", "Ta bort " + item.namn);
    del.title = "Ta bort";
    del.addEventListener("click", function () {
      deleteItem(item.id);
    });

    li.appendChild(label);
    li.appendChild(createMoveElement(item));
    li.appendChild(del);
    return li;
  }

  // Liten knapp med kategorins ikon. En osynlig <select> ligger ovanpå,
  // så att telefonens eller webbläsarens egen väljare öppnas vid tryck.
  function createMoveElement(item) {
    var current = Kategorier.lista.filter(function (k) { return k.id === item.kategori; })[0];

    var wrap = document.createElement("span");
    wrap.className = "move";
    wrap.title = "Byt kategori (nu: " + current.namn + ")";

    var icon = document.createElement("span");
    icon.className = "move-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = current.ikon;

    var select = document.createElement("select");
    select.setAttribute("aria-label", "Byt kategori för " + item.namn);
    Kategorier.lista.forEach(function (kat) {
      var option = document.createElement("option");
      option.value = kat.id;
      option.textContent = kat.ikon + " " + kat.namn;
      option.selected = kat.id === item.kategori;
      select.appendChild(option);
    });
    select.addEventListener("change", function () {
      moveItem(item.id, select.value);
    });

    wrap.appendChild(icon);
    wrap.appendChild(select);
    return wrap;
  }

  var suggestions = Forslag.attach({
    input: input,
    listbox: document.getElementById("suggestions"),
    sorter: sorter,
    // Varor som redan står på listan (och inte är avbockade) föreslås inte.
    getExcluded: function () {
      return items.filter(function (i) { return !i.klar; }).map(function (i) { return i.namn; });
    },
    onChoose: function (forslag) {
      // Har man valt en kategori själv gäller den, annars förslagets kategori.
      var kategori = categorySelect.value === "auto" ? forslag.kategori : categorySelect.value;
      addItem(forslag.namn, kategori);
      input.value = "";
      categorySelect.value = "auto";
      input.focus();
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = input.value.trim();
    suggestions.close();
    if (name) addItem(name, categorySelect.value);
    input.value = "";
    categorySelect.value = "auto";
    input.focus();
  });

  Kategorier.lista.forEach(function (kat) {
    var option = document.createElement("option");
    option.value = kat.id;
    option.textContent = kat.ikon + " " + kat.namn;
    categorySelect.appendChild(option);
  });

  var confirmDialog = document.getElementById("confirm-dialog");
  var confirmText = document.getElementById("confirm-text");

  clearDoneBtn.addEventListener("click", function () {
    var doneCount = items.filter(function (i) { return i.klar; }).length;
    if (doneCount === 0) return;
    confirmText.textContent = doneCount === 1
      ? "1 avbockad vara tas bort från listan."
      : doneCount + " avbockade varor tas bort från listan.";

    if (typeof confirmDialog.showModal !== "function") {
      // Mycket gamla webbläsare saknar <dialog>, rensa då direkt.
      clearDone();
      return;
    }
    confirmDialog.returnValue = "";
    confirmDialog.showModal();
  });

  confirmDialog.addEventListener("close", function () {
    if (confirmDialog.returnValue === "rensa") clearDone();
  });

  render();
})();
