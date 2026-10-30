/* script.js — SS14 NanoChem Assistant
 *
 * Auto-updating chemistry calculator: fetches reagent/reaction/locale files
 * directly from the fish-station GitHub repository (raw.githubusercontent.com,
 * CORS-enabled), parses them with fs-parser.js, and builds the recipe database
 * at runtime. A 24h localStorage cache avoids re-fetching on every visit, and
 * a bundled reagents-data.json snapshot is used as offline fallback.
 *
 * Data source: https://github.com/makura-games/fish-station  (branch master)
 */

(function () {
  "use strict";

  // ---- Config ----
  var REPO = "makura-games/fish-station";
  var BRANCH = "master";
  var RAW_BASE = "https://raw.githubusercontent.com/" + REPO + "/" + BRANCH + "/";
  var TREE_API = "https://api.github.com/repos/" + REPO + "/git/trees/" + BRANCH + "?recursive=1";
  var BUNDLED_JSON = "reagents-data.json";
  var CACHE_KEY = "fschem_data_v1";
  var FILELIST_KEY = "fschem_filelist_v1";
  var CACHE_TTL_MS = 24 * 60 * 60 * 1000;       // 24h for built data
  var FILELIST_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7d for discovered file list

  // ---- Hardcoded file list (stable fallback when GitHub API is rate-limited) ----
  var DEFAULT_REAGENT_FILES = [
    "Resources/Prototypes/Reagents/Consumable/Drink/alcohol.yml",
    "Resources/Prototypes/Reagents/Consumable/Drink/base_drink.yml",
    "Resources/Prototypes/Reagents/Consumable/Drink/drinks.yml",
    "Resources/Prototypes/Reagents/Consumable/Drink/juice.yml",
    "Resources/Prototypes/Reagents/Consumable/Drink/soda.yml",
    "Resources/Prototypes/Reagents/Consumable/Food/condiments.yml",
    "Resources/Prototypes/Reagents/Consumable/Food/food.yml",
    "Resources/Prototypes/Reagents/Consumable/Food/ingredients.yml",
    "Resources/Prototypes/Reagents/Materials/glass.yml",
    "Resources/Prototypes/Reagents/Materials/materials.yml",
    "Resources/Prototypes/Reagents/Materials/metals.yml",
    "Resources/Prototypes/Reagents/Materials/ores.yml",
    "Resources/Prototypes/Reagents/biological.yml",
    "Resources/Prototypes/Reagents/botany.yml",
    "Resources/Prototypes/Reagents/chemicals.yml",
    "Resources/Prototypes/Reagents/cleaning.yml",
    "Resources/Prototypes/Reagents/elements.yml",
    "Resources/Prototypes/Reagents/fun.yml",
    "Resources/Prototypes/Reagents/gases.yml",
    "Resources/Prototypes/Reagents/medicine.yml",
    "Resources/Prototypes/Reagents/narcotics.yml",
    "Resources/Prototypes/Reagents/pyrotechnic.yml",
    "Resources/Prototypes/Reagents/toxins.yml",
  ];
  var DEFAULT_REACTION_FILES = [
    "Resources/Prototypes/Recipes/Reactions/biological.yml",
    "Resources/Prototypes/Recipes/Reactions/botany.yml",
    "Resources/Prototypes/Recipes/Reactions/chemicals.yml",
    "Resources/Prototypes/Recipes/Reactions/cleaning.yml",
    "Resources/Prototypes/Recipes/Reactions/drinks.yml",
    "Resources/Prototypes/Recipes/Reactions/food.yml",
    "Resources/Prototypes/Recipes/Reactions/fun.yml",
    "Resources/Prototypes/Recipes/Reactions/gas.yml",
    "Resources/Prototypes/Recipes/Reactions/medicine.yml",
    "Resources/Prototypes/Recipes/Reactions/pyrotechnic.yml",
    "Resources/Prototypes/Recipes/Reactions/single_reagent.yml",
    "Resources/Prototypes/Recipes/Reactions/soap.yml",
  ];
  var DEFAULT_LOCALE_FILES = [
    "Resources/Locale/ru-RU/_strings/_fish/reagents/meta/consumable/drink/juice.ftl",
    "Resources/Locale/ru-RU/_strings/_fish/reagents/meta/gases.ftl",
    "Resources/Locale/ru-RU/_strings/_sunrise/reagents/meta/biological.ftl",
    "Resources/Locale/ru-RU/_strings/_sunrise/reagents/meta/consumable/drink/alcohol.ftl",
    "Resources/Locale/ru-RU/_strings/_sunrise/reagents/meta/consumable/drink/drinks.ftl",
    "Resources/Locale/ru-RU/_strings/_sunrise/reagents/meta/consumable/drink/soda.ftl",
    "Resources/Locale/ru-RU/_strings/_sunrise/reagents/meta/consumable/food/condiments.ftl",
    "Resources/Locale/ru-RU/_strings/_sunrise/reagents/meta/fun.ftl",
    "Resources/Locale/ru-RU/_strings/_sunrise/reagents/meta/gases.ftl",
    "Resources/Locale/ru-RU/_strings/_sunrise/reagents/meta/medicine.ftl",
    "Resources/Locale/ru-RU/_strings/_sunrise/reagents/meta/physical-desc.ftl",
    "Resources/Locale/ru-RU/_strings/_sunrise/reagents/meta/toxins.ftl",
    "Resources/Locale/ru-RU/_strings/reagents/meta/biological.ftl",
    "Resources/Locale/ru-RU/_strings/reagents/meta/botany.ftl",
    "Resources/Locale/ru-RU/_strings/reagents/meta/chemicals.ftl",
    "Resources/Locale/ru-RU/_strings/reagents/meta/cleaning.ftl",
    "Resources/Locale/ru-RU/_strings/reagents/meta/consumable/drink/alcohol.ftl",
    "Resources/Locale/ru-RU/_strings/reagents/meta/consumable/drink/drinks.ftl",
    "Resources/Locale/ru-RU/_strings/reagents/meta/consumable/drink/juice.ftl",
    "Resources/Locale/ru-RU/_strings/reagents/meta/consumable/drink/soda.ftl",
    "Resources/Locale/ru-RU/_strings/reagents/meta/consumable/food/condiments.ftl",
    "Resources/Locale/ru-RU/_strings/reagents/meta/consumable/food/food.ftl",
    "Resources/Locale/ru-RU/_strings/reagents/meta/consumable/food/ingredients.ftl",
    "Resources/Locale/ru-RU/_strings/reagents/meta/elements.ftl",
    "Resources/Locale/ru-RU/_strings/reagents/meta/fun.ftl",
    "Resources/Locale/ru-RU/_strings/reagents/meta/gases.ftl",
    "Resources/Locale/ru-RU/_strings/reagents/meta/medicine.ftl",
    "Resources/Locale/ru-RU/_strings/reagents/meta/narcotics.ftl",
    "Resources/Locale/ru-RU/_strings/reagents/meta/physical-desc.ftl",
    "Resources/Locale/ru-RU/_strings/reagents/meta/pyrotechnic.ftl",
    "Resources/Locale/ru-RU/_strings/reagents/meta/toxins.ftl",
  ];

  var REAGENT_RE = /^Resources\/Prototypes\/Reagents\/.*\.yml$/;
  var REACTION_RE = /^Resources\/Prototypes\/Recipes\/Reactions\/.*\.yml$/;
  var LOCALE_RE = /^Resources\/Locale\/ru-RU\/_strings\/(_sunrise\/)?reagents\/meta\/.*\.ftl$/;
  var LOCALE_FISH_RE = /^Resources\/Locale\/ru-RU\/_strings\/_fish\/reagents\/.*\.ftl$/;

  // ---- Mutable data globals (populated by loadData) ----
  var materials = {};
  var reactionTemps = {};
  var chemDescriptions = {};
  var medLabels = {};
  var chemCategories = {};
  var categoryOrder = [];
  var dataMeta = null;

  // ---- DOM refs ----
  var selectEl, amountEl, roundUpEl, resultsArea, refreshBtn, statusEl;

  // ============================================================
  //  Data loading
  // ============================================================

  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || !obj.data || !obj.ts) return null;
      return obj;
    } catch (e) { return null; }
  }
  function writeCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data }));
    } catch (e) { /* quota / private mode */ }
  }
  function clearCache() { try { localStorage.removeItem(CACHE_KEY); } catch (e) {} }

  function readCachedFileList() {
    try {
      var raw = localStorage.getItem(FILELIST_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || !obj.ts || !obj.files) return null;
      return obj;
    } catch (e) { return null; }
  }
  function writeCachedFileList(obj) {
    try {
      localStorage.setItem(FILELIST_KEY, JSON.stringify({ ts: Date.now(), files: obj.files, commit: obj.commit, commitDate: obj.commitDate }));
    } catch (e) {}
  }

  // Discover the file list via the GitHub trees API (ONE call, cached 7 days).
  // Also captures the commit SHA from the same response so we don't need a
  // second API call. Falls back to the hardcoded list on any failure.
  function discoverFiles() {
    var cached = readCachedFileList();
    if (cached && (Date.now() - cached.ts) < FILELIST_TTL_MS) {
      return Promise.resolve({ files: cached.files, commit: cached.commit || "live", commitDate: cached.commitDate || "" });
    }
    return fetch(TREE_API, { headers: { "Accept": "application/vnd.github+json" } })
      .then(function (r) {
        if (!r.ok) throw new Error("tree API " + r.status);
        return r.json();
      })
      .then(function (j) {
        if (!j || !j.tree) throw new Error("bad tree");
        var rf = [], xf = [], lf = [];
        j.tree.forEach(function (e) {
          if (e.type !== "blob") return;
          var p = e.path;
          if (REAGENT_RE.test(p)) rf.push(p);
          else if (REACTION_RE.test(p)) xf.push(p);
          else if (LOCALE_RE.test(p) || LOCALE_FISH_RE.test(p)) lf.push(p);
        });
        rf.sort(); xf.sort(); lf.sort();
        if (rf.length === 0 || xf.length === 0) throw new Error("empty tree");
        var files = { reagentFiles: rf, reactionFiles: xf, localeFiles: lf };
        var commit = (j.sha && typeof j.sha === "string") ? j.sha.substring(0, 7) : "live";
        writeCachedFileList({ files: files, commit: commit, commitDate: "" });
        return { files: files, commit: commit, commitDate: "" };
      })
      .catch(function () {
        return {
          files: {
            reagentFiles: DEFAULT_REAGENT_FILES.slice(),
            reactionFiles: DEFAULT_REACTION_FILES.slice(),
            localeFiles: DEFAULT_LOCALE_FILES.slice(),
          },
          commit: "live", commitDate: "",
        };
      });
  }

  function fetchText(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(url + " -> " + r.status);
      return r.text();
    });
  }

  function fetchAllFiles(fileList, onProgress) {
    var paths = fileList.reagentFiles
      .map(function (p) { return { kind: "reagent", path: p }; })
      .concat(fileList.reactionFiles.map(function (p) { return { kind: "reaction", path: p }; }))
      .concat(fileList.localeFiles.map(function (p) { return { kind: "locale", path: p }; }));

    var total = paths.length, done = 0;
    return Promise.all(paths.map(function (item) {
      return fetchText(RAW_BASE + item.path).then(function (text) {
        done++;
        if (onProgress) onProgress(done, total, item.path);
        return { kind: item.kind, path: item.path, text: text };
      });
    })).then(function (results) {
      var reagentFiles = [], reactionFiles = [], localeFiles = [];
      results.forEach(function (r) {
        if (r.kind === "reagent") reagentFiles.push(r);
        else if (r.kind === "reaction") reactionFiles.push(r);
        else localeFiles.push(r);
      });
      return { reagentFiles: reagentFiles, reactionFiles: reactionFiles, localeFiles: localeFiles };
    });
  }


  function applyData(data, source) {
    materials = data.materials || {};
    reactionTemps = data.reactionTemps || {};
    chemDescriptions = data.chemDescriptions || {};
    medLabels = data.medLabels || {};
    chemCategories = data.chemCategories || {};
    categoryOrder = data.categoryOrder || [];
    dataMeta = data.meta || null;
    dataMeta = dataMeta || {};
    dataMeta._source = source;
  }

  function loadBundled() {
    return fetch(BUNDLED_JSON).then(function (r) {
      if (!r.ok) throw new Error("bundled " + r.status);
      return r.json();
    });
  }

  function loadData(forceRefresh) {
    setStatus("Загрузка данных…", "loading");

    // 1. fresh cache?
    if (!forceRefresh) {
      var c = readCache();
      if (c && (Date.now() - c.ts) < CACHE_TTL_MS) {
        applyData(c.data, "cache");
        return finishLoad();
      }
    }

    // 2. fetch fresh from repo
    return discoverFiles()
      .then(function (disc) {
        return fetchAllFiles(disc.files, function (done, total, p) {
          setStatus("Загрузка из репозитория… " + done + "/" + total, "loading");
        }).then(function (files) {
          var data = FsParser.buildData(files, { commit: disc.commit, commitDate: disc.commitDate });
          writeCache(data);
          applyData(data, "repo");
          return finishLoad();
        });
      })
      .catch(function (err) {
        // 3. fallback to bundled snapshot
        return loadBundled()
          .then(function (data) {
            applyData(data, "bundled");
            return finishLoad();
          })
          .catch(function (err2) {
            setStatus("Не удалось загрузить данные. Проверьте подключение к интернету и нажмите «Обновить».", "error");
            console.error("loadData failed:", err, err2);
          });
      });
  }

  function finishLoad() {
    if (!materials || Object.keys(materials).length === 0) {
      setStatus("Данные пусты.", "error");
      return;
    }
    initSelect();
    updateCalculation();
    renderStatusBadge();
    setStatus("", "ok");
  }

  // ============================================================
  //  Status badge + refresh
  // ============================================================

  function renderStatusBadge() {
    if (!dataMeta) return;
    var src = dataMeta._source || "?";
    var srcLabel = { repo: "репозиторий (live)", cache: "кэш", bundled: "локальный снимок" }[src] || src;
    var commit = dataMeta.commit || "";
    var isSha = /^[0-9a-f]{7,40}$/i.test(commit);
    var commitLine = isSha
      ? "Коммит: <code>" + commit + "</code>"
      : "Ветка: <code>" + BRANCH + "</code>";
    var gen = dataMeta.generatedAt ? new Date(dataMeta.generatedAt) : null;
    var genTxt = gen ? gen.toLocaleDateString("ru-RU") + " " + gen.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) : "";
    var count = dataMeta.recipeCount || Object.keys(materials).length;
    var html = "<div class='data-badge'><span class='badge-src badge-" + src + "'>Источник: " + srcLabel + "</span>" +
      "<span class='badge-meta'>" + commitLine + "</span>" +
      "<span class='badge-meta'>Рецептов: " + count + "</span>" +
      (genTxt ? "<span class='badge-meta'>Обновлено: " + genTxt + "</span>" : "") +
      "</div>";
    if (statusEl) statusEl.innerHTML = html;
  }

  function setStatus(text, kind) {
    if (!statusEl) return;
    if (kind === "ok") { /* keep badge */ return; }
    if (text) {
      statusEl.innerHTML = "<div class='data-status data-status-" + kind + "'>" + text + "</div>";
    } else {
      statusEl.innerHTML = "";
    }
  }

  // ============================================================
  //  Calculation (preserved from original calculator)
  // ============================================================

  function snapToGrid(val, decimals) {
    decimals = decimals || 2;
    var factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
  }

  function calculateRecipe(targetName, targetAmount, isRoundUp) {
    var baseMultipliers = {};

    function getMultipliers(name, amount) {
      var recipe = materials[name];
      if (!recipe) {
        baseMultipliers[name] = (baseMultipliers[name] || 0) + amount;
        return;
      }
      for (var ingName in recipe) {
        if (recipe[ingName] === "catalyst") continue;
        var needed = amount * recipe[ingName];
        getMultipliers(ingName, needed);
      }
    }

    getMultipliers(targetName, targetAmount);

    var actualBases = {};
    for (var base in baseMultipliers) {
      var exactNeed = snapToGrid(baseMultipliers[base], 2);
      actualBases[base] = isRoundUp ? Math.ceil(exactNeed) : Math.floor(exactNeed);
    }

    var topoOrder = [];
    var visited = {};
    function buildTopo(name) {
      if (visited[name]) return;
      visited[name] = true;
      var recipe = materials[name];
      if (!recipe) return;
      for (var ingName in recipe) {
        if (recipe[ingName] !== "catalyst") buildTopo(ingName);
      }
      topoOrder.push(name);
    }
    buildTopo(targetName);

    var yields = Object.assign({}, actualBases);
    var stepsData = {};

    for (var i = 0; i < topoOrder.length; i++) {
      var name = topoOrder[i];
      var recipe = materials[name];
      var totalRatio = 0;
      for (var k in recipe) {
        if (recipe[k] !== "catalyst") totalRatio += recipe[k];
      }
      var limitingVolume = Infinity;
      var stepIngredients = {};
      for (var ingName in recipe) {
        if (recipe[ingName] === "catalyst") {
          stepIngredients[ingName] = { amount: 1, isCatalyst: true };
          continue;
        }
        var have = yields[ingName] || 0;
        var needRatio = recipe[ingName];
        var maxPossible = have / needRatio;
        if (maxPossible < limitingVolume) limitingVolume = maxPossible;
      }
      if (limitingVolume === Infinity) limitingVolume = 0;
      var rawYield = limitingVolume * totalRatio;
      var actualYield = Math.floor(snapToGrid(rawYield, 2) + 0.001);
      yields[name] = actualYield;
      for (var ingName2 in recipe) {
        if (recipe[ingName2] === "catalyst") continue;
        var useAmount = Math.floor(snapToGrid(limitingVolume * recipe[ingName2], 2) + 0.001);
        stepIngredients[ingName2] = { amount: useAmount, isCatalyst: false };
        if (!materials[ingName2]) {
          actualBases[ingName2] = actualBases[ingName2] || 0;
        }
      }
      var catalystVol = 0;
      for (var sk in stepIngredients) {
        if (stepIngredients[sk].isCatalyst) catalystVol += stepIngredients[sk].amount;
      }
      stepsData[name] = {
        yield: actualYield,
        ingredients: stepIngredients,
        mixVolume: actualYield + catalystVol,
        catalystVolume: catalystVol,
      };
    }

    var displaySteps = topoOrder.map(function (name) {
      var d = stepsData[name];
      var finalIngredients = {};
      for (var ing in d.ingredients) finalIngredients[ing] = d.ingredients[ing].amount;
      return {
        name: name,
        ingredients: materials[name],
        finalIngredients: finalIngredients,
        finalVolume: d.yield,
        mixVolume: d.mixVolume,
        catalystVolume: d.catalystVolume,
      };
    });

    var finalStep = displaySteps[displaySteps.length - 1];
    return { displaySteps: displaySteps, shoppingList: actualBases, finalStep: finalStep };
  }

  // ============================================================
  //  UI
  // ============================================================

  function initSelect() {
    selectEl.innerHTML = "";
    var added = {};
    categoryOrder.forEach(function (catName) {
      var chems = chemCategories[catName];
      if (catName === "Прочее") {
        chems = Object.keys(materials).filter(function (k) { return !added[k]; });
      }
      if (!chems || chems.length === 0) return;
      chems.sort();
      var group = document.createElement("optgroup");
      group.label = catName;
      chems.forEach(function (med) {
        if (materials[med]) {
          var opt = document.createElement("option");
          opt.value = med;
          opt.textContent = med;
          group.appendChild(opt);
          added[med] = true;
        }
      });
      if (group.childNodes.length) selectEl.appendChild(group);
    });
    if (selectEl.options.length > 0) selectEl.selectedIndex = 0;
  }

  function updateCalculation() {
    if (!selectEl || !amountEl || !resultsArea) return;
    if (!materials || Object.keys(materials).length === 0) return;

    var medName = selectEl.value;
    var requestAmount = parseInt(amountEl.value, 10) || 200;
    var isRoundUp = roundUpEl.checked;

    if (!materials[medName]) {
      resultsArea.innerHTML = "<div style='text-align:center; padding: 3rem; color: var(--text-muted);'>Вещество не найдено в базе данных.</div>";
      return;
    }

    var res = calculateRecipe(medName, requestAmount, isRoundUp);
    var displaySteps = res.displaySteps, shoppingList = res.shoppingList, finalStep = res.finalStep;

    var shopHtml = Object.keys(shoppingList).sort()
      .map(function (ing) {
        return "<tr><td>" + ing + "</td><td style='color:var(--accent); font-weight:bold;'>" + shoppingList[ing] + " u</td></tr>";
      }).join("");

    var requestMatches = (finalStep.finalVolume === requestAmount);
    var modeText = isRoundUp ? "С запасом" : "Строгое";
    var warningHtml = "";
    if (!requestMatches && finalStep.finalVolume < requestAmount) {
      warningHtml = "<div class='volume-warning'>Получено меньше из-за пропорций и округления базовых элементов.</div>";
    }

    var stepsHtml = "";
    if (displaySteps.length === 0) {
      stepsHtml = "<div style='color: var(--text-muted);'>Это базовый реагент.</div>";
    } else {
      displaySteps.forEach(function (step) {
        var isFinal = step.name === medName;
        var pillsHtml = "";
        for (var ingName in step.finalIngredients) {
          var amount = step.finalIngredients[ingName];
          if (amount && amount > 0) {
            var isCreated = materials[ingName];
            var isCatalyst = (step.ingredients[ingName] === "catalyst");
            var note = "", className = "";
            if (isCatalyst) { note = "(Катализатор)"; className = "catalyst"; }
            else if (isCreated) { note = "(Создано)"; }
            pillsHtml += "<div class='ing-pill " + className + "'><span class='ing-name'>" + ingName + "</span> <span>" + amount + "u</span> " + note + "</div>";
          }
        }
        var tempHtml = "";
        if (reactionTemps[step.name]) {
          tempHtml = "<span class='temp-badge'>🔥 " + reactionTemps[step.name] + "K</span>";
        }
        var titleClass = isFinal ? "step-final" : "";
        var mixInfoHtml = "";
        if (step.catalystVolume > 0) {
          mixInfoHtml = "<div class='step-mix-info'>Всего в смеси: " + step.mixVolume + "u (включая " + step.catalystVolume + "u катализатора)</div>";
        }
        stepsHtml += "<div class='step-item'><div class='step-marker'></div><div class='step-header'><span class='" + titleClass + "'>" + step.name + " (" + step.finalVolume + "u)</span>" + tempHtml + "</div>" + mixInfoHtml + "<div class='step-ingredients'>" + pillsHtml + "</div></div>";
      });
    }

    var descriptionHtml = medLabels[medName]
      ? "<div style='font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; font-weight: normal;'>" + medLabels[medName] + "</div>"
      : "";
    var fullDesc = chemDescriptions[medName]
      ? "<div style='font-size: 0.8rem; color: var(--text-muted); margin-top: 6px; line-height:1.4;'>" + chemDescriptions[medName] + "</div>"
      : "";

    resultsArea.innerHTML =
      "<div class='card'>" +
        "<div class='card-header'>" +
          "<div><h2 style='margin:0'>" + medName + "</h2>" + descriptionHtml + fullDesc + "</div>" +
          "<div style='text-align:right'>" +
            "<div class='volume-main'>" + (finalStep.finalVolume || 0) + " u</div>" +
            (requestMatches ? "" : "<div class='volume-sub'>Запрос: " + requestAmount + "u</div>") +
            "<div class='volume-sub' style='opacity:0.6'>Режим: " + modeText + "</div>" +
            warningHtml +
          "</div>" +
        "</div>" +
        "<div class='card-body'>" +
          "<h3 style='margin-top:0'>🛒 Базовые элементы</h3>" +
          "<p class='info-text'>Базовые реагенты, которые нужно взять из диспенсеров.</p>" +
          "<table><thead><tr><th>Вещество</th><th>Кол-во</th></tr></thead><tbody>" + shopHtml + "</tbody></table>" +
          "<hr style='border:0; border-top:1px solid var(--border); margin: 2rem 0;'>" +
          "<h3 style='margin-top:0'>⚗️ Пошаговое приготовление</h3>" +
          "<div class='steps-container'>" + stepsHtml + "</div>" +
        "</div>" +
      "</div>";
  }

  // ============================================================
  //  Init
  // ============================================================

  window.addEventListener("DOMContentLoaded", function () {
    selectEl = document.getElementById("medicineSelect");
    amountEl = document.getElementById("targetAmount");
    roundUpEl = document.getElementById("roundUpMode");
    resultsArea = document.getElementById("resultsArea");
    refreshBtn = document.getElementById("refreshBtn");
    statusEl = document.getElementById("dataStatus");

    if (!selectEl || !amountEl || !resultsArea) {
      console.error("Критическая ошибка: Не найдены элементы DOM.");
      return;
    }

    if (refreshBtn) {
      refreshBtn.addEventListener("click", function () {
        refreshBtn.disabled = true;
        clearCache();
        resultsArea.innerHTML = "<div style='text-align:center; padding: 3rem; color: var(--text-muted);'>Обновление данных…</div>";
        loadData(true).then(function () {
          refreshBtn.disabled = false;
        });
      });
    }

    selectEl.addEventListener("change", updateCalculation);
    amountEl.addEventListener("input", updateCalculation);
    roundUpEl.addEventListener("change", updateCalculation);

    resultsArea.innerHTML = "<div style='text-align:center; padding: 3rem; color: var(--text-muted);'>Загрузка данных из репозитория…</div>";
    loadData(false);
  });

  // expose for debugging
  window.FsChem = {
    refresh: function () { clearCache(); return loadData(true); },
    getData: function () { return { materials: materials, reactionTemps: reactionTemps, meta: dataMeta }; },
  };
})();