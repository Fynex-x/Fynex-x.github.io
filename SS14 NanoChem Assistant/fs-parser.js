/* fs-parser.js — fish-station reagent/reaction parser.
 * Isomorphic: runs in the browser (loaded via <script>) and in Node.js
 * (require('./fs-parser.js')). Parses YAML reaction/reagent files and .ftl
 * locale files, and builds the data structures consumed by the calculator
 * (materials, reactionTemps, chemDescriptions, medLabels, chemCategories,
 * categoryOrder).
 *
 * No external dependencies. Line-based parsing tuned to the stable SS14
 * prototype YAML format.
 */
(function (global) {
  "use strict";

  var GROUP_TO_CATEGORY = {
    Medicine: "Медицина", Toxins: "Токсины", Elements: "Элементы",
    Narcotics: "Наркотики", Foods: "Пищевые", Biological: "Биология",
    Botanical: "Ботаника", Drinks: "Напитки", Special: "Особые",
    Pyrotechnic: "Пиротехника", Cleaning: "Чистящие", Fun: "Забавы",
    Gases: "Газы", Materials: "Материалы", Consumable: "Пищевые",
  };
  var CATEGORY_TO_LABEL = {
    "Медицина": "(Лекарство)", "Токсины": "(Токсин)", "Элементы": "(Элемент)",
    "Наркотики": "(Наркотик)", "Пищевые": "(Пища)", "Биология": "(Биология)",
    "Ботаника": "(Ботаника)", "Напитки": "(Напиток)", "Особые": "(Особое)",
    "Пиротехника": "(Пиротехника)", "Чистящие": "(Чистящее)", "Забавы": "(Забава)",
    "Газы": "(Газ)", "Материалы": "(Материал)", "Химикаты": "(Химикат)",
    "Прочее": "(Прочее)",
  };
  var CATEGORY_ORDER = [
    "Медицина", "Токсины", "Наркотики", "Пиротехника", "Биология",
    "Ботаника", "Химикаты", "Чистящие", "Забавы", "Пищевые", "Напитки",
    "Особые", "Элементы", "Газы", "Материалы", "Прочее",
  ];

  function stripComment(val) {
    if (val.indexOf("#") !== -1 && val[0] !== '"' && val[0] !== "'") {
      val = val.split("#")[0].trim();
    }
    return val;
  }

  // ---- YAML reaction parser ----
  function parseReactions(text) {
    var out = [];
    var lines = text.split("\n");
    var i = 0, n = lines.length;
    while (i < n) {
      if (!/^- type: reaction\s*$/.test(lines[i])) { i++; continue; }
      var rxn = { id: null, minTemp: null, maxTemp: null, reactants: {}, products: {} };
      i++;
      var section = null, cur = null;
      while (i < n) {
        var l = lines[i];
        if (/^- type:\s/.test(l)) break;
        if (l.trim() === "") { i++; continue; }
        var m2 = /^  (\w+)\s*:\s*(.*)$/.exec(l);
        if (m2) {
          var key = m2[1], val = stripComment(m2[2].trim());
          cur = null;
          if (key === "id") { rxn.id = val; section = null; }
          else if (key === "minTemp" || key === "maxTemp") {
            rxn[key] = val ? parseFloat(val) : null;
            if (isNaN(rxn[key])) rxn[key] = null;
            section = null;
          } else if (key === "reactants") { section = "reactants"; }
          else if (key === "products") { section = "products"; }
          else { section = "skip"; }
          i++; continue;
        }
        var m3 = /^    (\S[^:]*?)\s*:\s*$/.exec(l);
        if (m3 && section === "reactants") {
          cur = m3[1].trim();
          rxn.reactants[cur] = { amount: null, catalyst: false };
          i++; continue;
        }
        var m4 = /^      (\w+)\s*:\s*(.*)$/.exec(l);
        if (m4 && section === "reactants" && cur) {
          var fk = m4[1], fv = stripComment(m4[2].trim());
          if (fk === "amount") {
            var amt = parseFloat(fv);
            if (!isNaN(amt)) rxn.reactants[cur].amount = amt;
          } else if (fk === "catalyst") {
            rxn.reactants[cur].catalyst = (fv.toLowerCase() === "true");
          }
          i++; continue;
        }
        var m5 = /^    (\S[^:]*?)\s*:\s*(.+)$/.exec(l);
        if (m5 && section === "products") {
          var pname = m5[1].trim();
          var pval = stripComment(m5[2].trim());
          var pv = parseFloat(pval);
          if (!isNaN(pv)) rxn.products[pname] = pv;
          i++; continue;
        }
        i++;
      }
      if (rxn.id) out.push(rxn);
    }
    return out;
  }

  // ---- YAML reagent parser ----
  function parseReagents(text) {
    var out = [];
    var lines = text.split("\n");
    var i = 0, n = lines.length;
    while (i < n) {
      if (!/^- type: reagent\s*$/.test(lines[i])) { i++; continue; }
      var rg = { id: null, name: null, group: null, desc: null, flavor: null };
      i++;
      while (i < n) {
        var l = lines[i];
        if (/^- type:\s/.test(l)) break;
        if (l.trim() === "") { i++; continue; }
        var m2 = /^  (\w+)\s*:\s*(.*)$/.exec(l);
        if (m2 && l.indexOf("    ") !== 0) {
          var key = m2[1], val = stripComment(m2[2].trim());
          val = val.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
          if ((key === "id" || key === "name" || key === "group" || key === "desc" || key === "flavor") && val) {
            rg[key] = val;
          }
          i++; continue;
        }
        i++;
      }
      if (rg.id) out.push(rg);
    }
    return out;
  }

  // ---- .ftl locale parser ----
  function parseFtl(text) {
    var d = {};
    var lines = text.split("\n");
    for (var li = 0; li < lines.length; li++) {
      var line = lines[li].replace(/\r$/, "");
      var m = /^(reagent-(?:name|desc)-\S+)\s*=\s*(.*)$/.exec(line);
      if (m) {
        var key = m[1].trim(), val = m[2].trim();
        if ((val[0] === '"' && val[val.length - 1] === '"') ||
            (val[0] === "'" && val[val.length - 1] === "'")) {
          val = val.substring(1, val.length - 1);
        }
        if (val[0] === "{") {
          var mm = /"([^"]+)"/.exec(val);
          if (mm) val = mm[1];
        }
        if (!(key in d)) d[key] = val;
      }
    }
    return d;
  }

  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function prettifyId(id) {
    return cap(id.replace(/([a-z0-9])([A-Z])/g, "$1 $2"));
  }

  function categoryFromPath(path) {
    var p = path.replace(/\\/g, "/");
    if (p.indexOf("/Consumable/Drink/") !== -1) return "Напитки";
    if (p.indexOf("/Consumable/Food/") !== -1) return "Пищевые";
    if (p.indexOf("/Materials/") !== -1) return "Материалы";
    var base = p.split("/").pop().toLowerCase();
    var map = {
      "medicine.yml": "Медицина", "toxins.yml": "Токсины", "narcotics.yml": "Наркотики",
      "pyrotechnic.yml": "Пиротехника", "biological.yml": "Биология", "botany.yml": "Ботаника",
      "chemicals.yml": "Химикаты", "cleaning.yml": "Чистящие", "fun.yml": "Забавы",
      "gases.yml": "Газы", "elements.yml": "Элементы",
    };
    return map[base] || null;
  }

  // ---- Build calculator data from fetched file contents ----
  function buildData(files, meta) {
    meta = meta || {};
    var locale = {};
    (files.localeFiles || []).forEach(function (f) {
      var part = parseFtl(f.text);
      for (var k in part) if (!(k in locale)) locale[k] = part[k];
    });
    var reagents = {};
    (files.reagentFiles || []).forEach(function (f) {
      var cat = categoryFromPath(f.path);
      parseReagents(f.text).forEach(function (r) {
        if (r.id && !reagents[r.id]) { reagents[r.id] = r; reagents[r.id]._cat = cat; }
      });
    });
    var reactions = [];
    (files.reactionFiles || []).forEach(function (f) {
      parseReactions(f.text).forEach(function (r) { reactions.push(r); });
    });

    function idToRu(rid) {
      var r = reagents[rid];
      if (!r || !r.name) return prettifyId(rid);
      var ru = locale[r.name];
      if (ru) return cap(ru);
      if (r.name.indexOf("reagent-name-") === 0) {
        return cap(r.name.replace("reagent-name-", "").replace(/-/g, " "));
      }
      return r.name;
    }
    function idToDesc(rid) {
      var r = reagents[rid];
      if (!r || !r.desc) return "";
      return locale[r.desc] || "";
    }

    var materials = {}, reactionTemps = {}, skipped = 0;
    reactions.forEach(function (rxn) {
      if (!rxn.products || rxn.products.length === 0) { skipped++; return; }
      if (!(rxn.id in rxn.products)) { skipped++; return; }
      var prodAmount = rxn.products[rxn.id];
      if (prodAmount <= 0) { skipped++; return; }
      var ruMain = idToRu(rxn.id);
      if (!ruMain) { skipped++; return; }
      var recipe = {};
      var ok = true;
      for (var rname in rxn.reactants) {
        var ri = rxn.reactants[rname];
        var ruR = idToRu(rname);
        if (!ruR) { continue; }
        if (ri.catalyst) {
          recipe[ruR] = "catalyst";
        } else if (ri.amount != null) {
          recipe[ruR] = Math.round((ri.amount / prodAmount) * 1e5) / 1e5;
        }
      }
      var hasIng = false;
      for (var k in recipe) { hasIng = true; break; }
      if (!hasIng) { skipped++; return; }
      if (ruMain in materials) return;
      materials[ruMain] = recipe;
      if (rxn.minTemp) reactionTemps[ruMain] = rxn.minTemp;
      else if (rxn.maxTemp) reactionTemps[ruMain] = rxn.maxTemp;
    });

    var chemDescriptions = {}, medLabels = {}, chemCategories = {};
    for (var rid in reagents) {
      var ru = idToRu(rid);
      if (!ru || !(ru in materials)) continue;
      var desc = idToDesc(rid);
      if (desc) chemDescriptions[ru] = desc;
      var r = reagents[rid];
      var cat = r._cat || GROUP_TO_CATEGORY[r.group] || "Прочее";
      medLabels[ru] = CATEGORY_TO_LABEL[cat] || "(Прочее)";
      if (!chemCategories[cat]) chemCategories[cat] = [];
      if (chemCategories[cat].indexOf(ru) === -1) chemCategories[cat].push(ru);
    }
    for (var c in chemCategories) chemCategories[c].sort();
    var ordered = {};
    CATEGORY_ORDER.forEach(function (c) {
      if (chemCategories[c] && chemCategories[c].length) ordered[c] = chemCategories[c];
    });
    Object.keys(chemCategories).sort().forEach(function (c) {
      if (!ordered[c] && chemCategories[c].length) ordered[c] = chemCategories[c];
    });

    return {
      meta: {
        sourceRepo: "makura-games/fish-station",
        branch: "master",
        commit: meta.commit || "live",
        commitDate: meta.commitDate || "",
        generatedAt: new Date().toISOString(),
        reagentCount: Object.keys(reagents).length,
        reactionCount: reactions.length,
        recipeCount: Object.keys(materials).length,
        skippedNonCrafting: skipped,
      },
      categoryOrder: Object.keys(ordered),
      chemCategories: ordered,
      materials: materials,
      reactionTemps: reactionTemps,
      chemDescriptions: chemDescriptions,
      medLabels: medLabels,
    };
  }

  var FsParser = {
    parseReactions: parseReactions,
    parseReagents: parseReagents,
    parseFtl: parseFtl,
    buildData: buildData,
    categoryFromPath: categoryFromPath,
  };
  global.FsParser = FsParser;
  if (typeof module !== "undefined" && module.exports) module.exports = FsParser;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));