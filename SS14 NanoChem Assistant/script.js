const materials = {
    "Дексалин": { "Кислород": 0.666, "Плазма": "catalyst" },
    "Акриоксарин": { "Литий": 0.33333, "Трикордразин": 0.33333, "Криоксадон": 0.33333 },
    "Алоксадон": { "Лепоразин": 0.5, "Криоксадон": 0.5, "Алоэ": 0.25 },
    "Амбузол": { "Диловен": 0.25, "Аммиак": 0.25, "Кровь Зомби": 0.5 },
    "Амбузол Плюс": { "Амбузол": 0.5, "Омнизин": 0.5 },
    "Аритразин": { "Водород": 0.5, "Хироналин": 0.5 },
    "Бикаридин": { "Инапровалин": 0.5, "Углерод": 0.5 },
    "Бруизин": { "Бикаридин": 0.5, "Литий": 0.45, "Сахар": 0.5 },
    "Бритвиум": { "Лацеринол": 1, "Бикаридин": 1 },
    "Галоперидол": { "Масло": 0.2, "Иодид Калия": 0.2, "Алюминий": 0.2, "Фтор": 0.2, "Масло": 0.2, "Хлор": 0.2 },
    "Гидроксид Натрия": { "Гидроксид": 0.5, "Натрий": 0.5 },
    "Гиперзин": { "Вестин": 0.5, "Эфедрин": 0.5, "Кислород": 1 },
    "Дексалин Плюс": { "Дексалин": 0.33333, "Железо": 0.33333, "Углерод": 0.33333 },
    "Дермалин": { "Келотан": 0.33333, "Кислород": 0.33333, "Фосфор": 0.33333 },
    "Дифенгидрамин": { "Диэтиламин": 0.2, "Масло": 0.2, "Столовая Соль": 0.2, "Углерод": 0.2, "Этанол": 0.2 },
    "Диловен": { "Азот": 0.33333, "Калий": 0.33333, "Кремний": 0.33333 },
    "Инапровалин": { "Кислород": 0.33333, "Сахар": 0.33333, "Углерод": 0.33333 },
    "Инсузин": { "Келотан": 0.33333, "Кремний": 0.33333, "Лепоразин": 0.33333 },
    "Иодид Калия": { "Йод": 0.5, "Калий": 0.5 },
    "Келотан": { "Кремний": 0.5, "Углерод": 0.5 },
    "Криоксадон": { "Вода": 0.33333, "Дексалин": 0.33333, "Кислород": 0.33333 },
    "Лацеринол": { "Бензол": 0.5, "Бикаридин": 0.5 },
    "Лепоразин": { "Силицид Железа": 0.5, "Медь": 0.5, "Плазма": "catalyst" },
    "Маннитол": { "Водород": 0.33333, "Сахар": 0.33333, "Вода": 0.33333 },
    "Масло": { "Сварочное Топливо": 0.33333, "Водород": 0.33333, "Углерод": 0.33333 },
    "Некрозол": { "Криоксадон": 1, "Омнизин": 0.5, "Кровь": 1.5 },
    "Нестабильный Мутаген": { "Радий": 0.33333, "Фосфор": 0.33333, "Хлор": 0.33333 },
    "Пунктураз": { "Бикаридин": 0.5, "Гидроксид": 0.5 },
    "Пиразин": { "Лепоразин": 0.33333, "Дермалин": 0.33333, "Углерод": 0.33333 },
    "Стимуляторы": { "Вестин": 0.5, "Эфедрин": 0.5, "Кислород": 1 },
    "Транексамовая Кислота": { "Инапровалин": 0.33333, "Сахар": 0.33333, "Серная Кислота": 0.33333 },
    "Трикордразин": { "Диловен": 0.5, "Инапровалин": 0.5 },
    "Фалангимин": { "Нестабильный Мутаген": 0.33333, "Хироналин": 0.33333, "Этанол": 0.33333 },
    "Физраствор": { "Вода": 0.8, "Столовая Соль": 0.2 },
    "Фенол": { "Бензол": 0.5, "Гидроксид": 0.5 },
    "Хироналин": { "Диловен": 0.5, "Радий": 0.5 },
    "Хлоральгидрат": { "Хлор": 3, "Этанол": 1, "Вода": 1 },
    "Эпинефрин": { "Гидроксид": 0.25, "Ацетон": 0.25, "Фенол": 0.25, "Хлор": 0.25 },
    "Эфедрин": { "Масло": 0.25, "Сахар": 0.25, "Диэтиламин": 0.25, "Водород": 0.25 },
    "Аммиак": { "Водород": 0.75, "Азот": 0.25 },
    "Ацетон": { "Масло": 0.5, "Сварочное Топливо": 0.5, "Кислород": 0.5 },
    "Бензол": { "Водород": 1, "Углерод": 1 },
    "Варфарин": { "Серная Кислота": 0.5, "Азот": 0.5, "Натрий": 0.5 },
    "Гидроксид": { "Кислород": 0.5, "Водород": 0.5 },
    "Диэтиламин": { "Аммиак": 0.5, "Этанол": 0.5 },
    "Столовая Соль": { "Натрий": 0.5, "Хлор": 0.5 },
    "Силицид Железа": { "Железо": 0.5, "Кремний": 0.5 },
    "Серная Кислота": { "Водород": 0.33333, "Сера": 0.33333, "Кислород": 0.66667 },
    "Уголь": { "Углерод": 1, "Зола": 1 },
    "Отбеливатель": { "Гидроксид Натрия": 0.2, "Космический Очиститель": 0.4, "Столовая Соль": 0.4 },
    "Космический Очиститель": { "Вода": 0.5, "Аммиак": 0.5 },
    "Напалм": { "Масло": 0.33333, "Этанол": 0.33333, "Сварочное Топливо": 0.33333 },
    "Пенообразователь": { "Литий": 0.5, "Водород": 0.5 },
    "Термит": { "Железо": 0.33333, "Алюминий": 0.33333, "Кислород": 0.33333 },
    "Окулин": { "Гидроксид": 0.5, "Столовая Соль": 0.25, "Кровь": 0.25 }
};

const reactionTemps = {
    "Сигинат": 370, "Инсузин": 433, "Пиразин": 540, "Дифенгидрамин": 377.59,
    "Некрозол": 370, "Оппорозидон": 400, "Пунктураз": 325, "Лацеринол": 335,
    "Алоксадон": 310, "Амбузол Плюс": 310, "Импедрезен": 370, "Гиперзин": 370,
    "Токсин Немоты": 370, "Дезоксиэфедрин": 370, "Токсин Майндбрейкер": 370,
    "Столовая Соль": 370, "Бензол": 310, "Силицид Железа": 310, "Гидроксид": 310
};

const priorityList = [
    "Окулин",
    "Дифенгидрамин",
    "Пиразин",
    "Инсузин",
    "Лепоразин",
    "Фалангимин",
    "Аритразин",
    "Дексалин Плюс",
    "Физраствор",
    "Пунктураз",
    "Бруизин",
    "Лацеринол"
];

const medLabels = {
    "Окулин": "(зрение)",
    "Пиразин": "(терма)",
    "Инсузин": "(электро)",
    "Лепоразин": "(обморожение)",
    "Фалангимин": "(клеточные)",
    "Аритразин": "(радиация)",
    "Дексалин Плюс": "(удушение)",
    "Физраствор": "(кровь)",
    "Пунктураз": "(уколы)",
    "Бруизин": "(ушибы)",
    "Лацеринол": "(порезы)"
};

const recipeEfficiency = {};
for (let chem in materials) {
    const comps = materials[chem];
    let sumRatios = 0;
    for (let k in comps) {
        if (typeof comps[k] !== 'string') {
            sumRatios += comps[k];
        }
    }
    recipeEfficiency[chem] = sumRatios > 0 ? 1 / sumRatios : 1;
}

let selectEl, amountEl, roundUpEl, resultsArea;

function getProductionGraph(targetName, targetAmount) {
    const steps = [];
    const visited = new Map();

    function buildNode(name, amount) {
        if (visited.has(name)) {
            const existing = visited.get(name);
            existing.targetAmount += amount;
            return existing;
        }

        const recipe = materials[name];
        const isBase = !recipe;

        const node = {
            name: name,
            targetAmount: amount,
            ingredients: recipe || {},
            children: [],
            isBase: isBase
        };

        visited.set(name, node);

        if (!isBase) {
            for (let ingName in node.ingredients) {
                if (node.ingredients[ingName] !== "catalyst") {
                    const neededVol = amount * node.ingredients[ingName];
                    const childNode = buildNode(ingName, neededVol);
                    node.children.push(childNode);
                }
            }
        }

        return node;
    }

    const rootNode = buildNode(targetName, targetAmount);

    function flatten(node, visitedSet = new Set()) {
        if (visitedSet.has(node.name)) return [];
        visitedSet.add(node.name);

        const list = [];
        node.children.forEach(child => list.push(...flatten(child, visitedSet)));
        list.push(node);
        return list;
    }

    return flatten(rootNode);
}

function calculateBottlenecks(steps, isRoundUp) {
    const stock = {};

    // --- ИСПРАВЛЕНИЕ ЦИКЛА: МАСЛО <-> СВАРОЧНОЕ ТОПЛИВО ---
    const hasOil = steps.some(s => s.name === "Масло");
    const hasFuel = steps.some(s => s.name === "Сварочное Топливо");
    if (hasOil && hasFuel) {
        if (!stock["Масло"]) stock["Масло"] = 5;
        if (!stock["Сварочное Топливо"]) stock["Сварочное Топливо"] = 5;
    }
    // ---------------------------------------------------------------

    steps.forEach(step => {
        if (step.isBase) return;

        let required = {};
        for (let ing in step.ingredients) {
            if (step.ingredients[ing] === "catalyst") {
                required[ing] = 1;
            } else {
                required[ing] = step.targetAmount * step.ingredients[ing];
            }
        }

        let limitingRatio = 1.0;

        for (let ing in required) {
            if (step.ingredients[ing] === "catalyst") continue;

            const need = required[ing];
            if (materials[ing]) {
                const have = stock[ing] || 0;
                if (have < need) {
                    const ratio = have / need;
                    if (ratio < limitingRatio) {
                        limitingRatio = ratio;
                    }
                }
            }
        }

        if (limitingRatio <= 0) {
            step.finalVolume = 0;
            step.finalIngredients = {};
            step.mixVolume = 0;
            return;
        }

        let actualIngredients = {};
        let reactantVolume = 0;
        let catalystVolume = 0;

        for (let ing in required) {
            const originalNeed = required[ing];
            const isCatalyst = (step.ingredients[ing] === "catalyst");
            let scaledNeed = isCatalyst ? 1 : originalNeed * limitingRatio;

            const isIntermediate = materials[ing];

            if (isCatalyst) {
                const isBase = !materials[ing];
                if (isBase) {
                     const use = 1;
                     actualIngredients[ing] = use;
                     catalystVolume += use;
                } else {
                    const have = stock[ing] || 0;
                    if (have >= 1) {
                        actualIngredients[ing] = 1;
                        catalystVolume += 1;
                    }
                }
            } else if (isIntermediate) {
                const use = Math.floor(scaledNeed);
                if (use > 0) {
                    actualIngredients[ing] = use;
                    reactantVolume += use;
                    stock[ing] -= use;
                }
            } else {
                let buyAmount = isRoundUp ? Math.ceil(scaledNeed + 0.001) : Math.floor(scaledNeed);
                if (buyAmount > 0) {
                    actualIngredients[ing] = buyAmount;
                    reactantVolume += buyAmount;
                }
            }
        }

        const efficiency = recipeEfficiency[step.name] || 1;
        let outputVolume = reactantVolume * efficiency;

        if (isRoundUp && outputVolume < step.targetAmount) {
             outputVolume = Math.ceil(outputVolume);
        } else {
            outputVolume = Math.floor(outputVolume);
        }

        stock[step.name] = outputVolume;

        step.finalIngredients = actualIngredients;
        step.finalVolume = outputVolume;
        step.mixVolume = outputVolume + catalystVolume;
        step.catalystVolume = catalystVolume;
    });
}

function initSelect() {
    const allMeds = Object.keys(materials).sort();

    selectEl.innerHTML = '';

    const pGroup = document.createElement('optgroup');
    pGroup.label = "Основная медицина";
    priorityList.forEach(med => {
        if (materials[med]) {
            const opt = document.createElement('option');
            opt.value = med;
            opt.textContent = med + (medLabels[med] || '');
            pGroup.appendChild(opt);
        }
    });
    selectEl.appendChild(pGroup);

    const aGroup = document.createElement('optgroup');
    aGroup.label = "Все вещества";
    allMeds.forEach(med => {
        if (!priorityList.includes(med)) {
            const opt = document.createElement('option');
            opt.value = med;
            opt.textContent = med;
            aGroup.appendChild(opt);
        }
    });
    selectEl.appendChild(aGroup);

    if (selectEl.options.length > 0) {
        selectEl.selectedIndex = 0;
    }
}

function updateCalculation() {
    if (!selectEl || !amountEl || !resultsArea) return;

    const medName = selectEl.value;
    const requestAmount = parseInt(amountEl.value) || 200;
    const isRoundUp = roundUpEl.checked;

    if (!materials[medName]) {
        resultsArea.innerHTML = `<div style="text-align:center; padding: 3rem; color: var(--text-muted);">Вещество не найдено в базе данных.</div>`;
        return;
    }

    const steps = getProductionGraph(medName, requestAmount);
    calculateBottlenecks(steps, isRoundUp);

    const shoppingList = {};
    steps.forEach(step => {
        if (step.isBase) return;

        for (let ingName in step.finalIngredients) {
            const isBase = !materials[ingName];
            if (isBase) {
                if (!shoppingList[ingName]) shoppingList[ingName] = 0;
                shoppingList[ingName] += step.finalIngredients[ingName];
            }
        }
    });

    const shopHtml = Object.keys(shoppingList).sort()
        .map(ing => `<tr><td>${ing}</td><td style="color:var(--accent); font-weight:bold;">${shoppingList[ing]} u</td></tr>`)
        .join('');

    const finalStep = steps[steps.length - 1];
    const requestMatches = (finalStep.finalVolume === requestAmount);
    let modeText = isRoundUp ? "С запасом" : "Строгое";

    let warningHtml = '';
    if (!isRoundUp && !requestMatches && finalStep.finalVolume < requestAmount) {
        warningHtml = `<div class="volume-warning">Получено меньше запрошенного из-за ограничений рецепта (округление).</div>`;
    }

    let stepsHtml = '';
    const displaySteps = steps.filter(s => !s.isBase);

    if (displaySteps.length === 0) {
        stepsHtml = '<div style="color: var(--text-muted);">Это базовый реагент, смешивание не требуется.</div>';
    } else {
        displaySteps.forEach((step, index) => {
            const isFinal = step.name === medName;
            let pillsHtml = '';

            if (!step.finalIngredients) return;

            for (let ingName in step.finalIngredients) {
                const amount = step.finalIngredients[ingName];
                if (amount && amount > 0) {
                    const isCreated = materials[ingName];
                    const isCatalyst = (step.ingredients[ingName] === "catalyst");

                    let note = '';
                    let className = '';

                    if (isCatalyst) {
                        note = '(Катализатор)';
                        className = 'catalyst';
                    } else if (isCreated) {
                        note = '(Создано)';
                    }

                    const nameSpan = `<span class="ing-name">${ingName}</span>`;
                    pillsHtml += `<div class="ing-pill ${className}">${nameSpan} <span>${amount}u</span> ${note}</div>`;
                }
            }

            let tempHtml = '';
            if (reactionTemps[step.name]) {
                tempHtml = `<span class="temp-badge">🔥 ${reactionTemps[step.name]}K</span>`;
            }

            const titleClass = isFinal ? 'step-final' : '';
            const vol = step.finalVolume !== undefined ? step.finalVolume : 0;

            let mixInfoHtml = '';
            if (step.catalystVolume > 0) {
                mixInfoHtml = `<div class="step-mix-info">Всего в смеси: ${step.mixVolume}u (включая ${step.catalystVolume}u катализатора)</div>`;
            }

            stepsHtml += `
                <div class="step-item">
                    <div class="step-marker"></div>
                    <div class="step-header">
                        <span class="${titleClass}">${step.name} (${vol}u)</span>
                        ${tempHtml}
                    </div>
                    ${mixInfoHtml}
                    <div class="step-ingredients">${pillsHtml}</div>
                </div>
            `;
        });
    }

    const html = `
        <div class="card">
            <div class="card-header">
                <div>
                    <h2 style="margin:0">${medName}</h2>
                </div>
                <div style="text-align:right">
                    <div class="volume-main">${finalStep.finalVolume || 0} u</div>
                    ${!requestMatches ? `<div class="volume-sub">Запрос: ${requestAmount}u</div>` : ''}
                    <div class="volume-sub" style="opacity:0.6">Режим: ${modeText}</div>
                    ${warningHtml}
                </div>
            </div>
            <div class="card-body">
                <h3 style="margin-top:0">🛒 Базовые элементы</h3>
                <p class="info-text">
                    Базовые реагенты, которые нужно взять из диспенсеров.
                </p>
                <table>
                    <thead><tr><th>Вещество</th><th>Кол-во</th></tr></thead>
                    <tbody>${shopHtml}</tbody>
                </table>
                <hr style="border:0; border-top:1px solid var(--border); margin: 2rem 0;">
                <h3 style="margin-top:0">⚗️ Пошаговое приготовление</h3>
                <div class="steps-container">${stepsHtml}</div>
            </div>
        </div>
    `;
    resultsArea.innerHTML = html;
}

window.addEventListener('DOMContentLoaded', () => {
    selectEl = document.getElementById('medicineSelect');
    amountEl = document.getElementById('targetAmount');
    roundUpEl = document.getElementById('roundUpMode');
    resultsArea = document.getElementById('resultsArea');

    if (!selectEl || !amountEl || !resultsArea) {
        console.error("Критическая ошибка: Не найдены элементы DOM.");
        return;
    }

    initSelect();
    updateCalculation();

    selectEl.addEventListener('change', updateCalculation);
    amountEl.addEventListener('input', updateCalculation);
    roundUpEl.addEventListener('change', updateCalculation);
});
