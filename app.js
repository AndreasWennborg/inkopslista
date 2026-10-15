(function () {
  "use strict";

  var STORAGE_KEY = "inkopslista.varor";

  var form = document.getElementById("add-form");
  var input = document.getElementById("item-input");
  var list = document.getElementById("list");
  var empty = document.getElementById("empty");
  var summary = document.getElementById("summary");
  var clearDoneBtn = document.getElementById("clear-done");

  var items = load();
  var justAddedId = null;

  function load() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // Sparandet misslyckades (t.ex. privat läge), listan fungerar ändå tills sidan laddas om.
    }
  }

  function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function addItem(name) {
    justAddedId = newId();
    items.push({ id: justAddedId, namn: name, klar: false });
    update();
    justAddedId = null;
  }

  function toggleItem(id) {
    items.forEach(function (item) {
      if (item.id === id) item.klar = !item.klar;
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
  }

  function update() {
    save();
    render();
  }

  function render() {
    // Ej avbockade först, avbockade längst ner. Inbördes ordning behålls.
    var sorted = items.filter(function (i) { return !i.klar; })
      .concat(items.filter(function (i) { return i.klar; }));

    list.textContent = "";
    sorted.forEach(function (item) {
      list.appendChild(createItemElement(item));
    });

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
    li.appendChild(del);
    return li;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = input.value.trim();
    if (name) addItem(name);
    input.value = "";
    input.focus();
  });

  clearDoneBtn.addEventListener("click", clearDone);

  render();
})();
