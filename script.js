const contentDisplay = document.getElementById('content-display');
const navContainer = document.querySelector('.nav-buttons');
let sectionsData = [];

/* Часы */
function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById('system-clock');
    if (clockEl) clockEl.innerText = now.toLocaleTimeString('ru-RU');
}
setInterval(updateClock, 1000);
updateClock();

/* Boot screen */
window.onload = function() {
    const log = document.getElementById('boot-log');
    const bar = document.getElementById('boot-progress');
    const bootScreen = document.getElementById('boot-screen');
    const mainInterface = document.getElementById('main-interface');
    
    const steps = [
        "CHECKING MEMORY INTEGRITY...",
        "LOADING NANOTRASEN PROTOCOLS...",
        "CONNECTING TO SECURE DATABASE...",
        "DECRYPTING PERSONNEL FILES...",
        "ACCESS GRANTED."
    ];

    let step = 0;
    let progress = 0;

    const bootInterval = setInterval(() => {
        progress += Math.random() * 5;
        if(progress > 100) progress = 100;
        bar.style.width = progress + "%";

        if (progress > (step + 1) * 20 && step < steps.length) {
            log.innerText = steps[step];
            step++;
        }

        if (progress >= 100) {
            clearInterval(bootInterval);
            log.innerText = steps[steps.length - 1];
            bar.style.width = "100%";

            setTimeout(() => {
                bootScreen.style.opacity = '0';
                setTimeout(() => {
                    bootScreen.style.display = 'none';
                    mainInterface.classList.add('active');
                    loadFileAndBuildUI();
                }, 500);
            }, 500);
        }
    }, 100);
};

/* Загрузка data.txt */
async function loadFileAndBuildUI(){
    try {
        const response = await fetch('data.txt');
        if(!response.ok) throw new Error("File not found");
        const text = await response.text();
        sectionsData = parseFile(text);
        buildNavigation(sectionsData);
        if(sectionsData.length>0) loadContent(sectionsData[0].id);
    } catch (e) {
        console.error("Ошибка загрузки data.txt", e);
        sectionsData = [
            {id:"demo", title:"Системная Ошибка", classified:true, content:"<b>ФАЙЛ DATA.TXT НЕ ОБНАРУЖЕН.</b>\nУбедитесь, что файл находится рядом с HTML."},
            {id:"demo2", title:"Личная папка", classified:false, content:"Это пример второй вкладки."}
        ];
        buildNavigation(sectionsData);
        loadContent("demo");
    }
}

function parseFile(text){
    const lines = text.split('\n');
    const sections = [];
    let current = null;

    lines.forEach(line=>{
        const cleanLine = line.trimEnd();
        if(cleanLine.startsWith('*')){
            if(current) sections.push(current);
            const title = cleanLine.replace('*','').trim();
            current = { id:title.toLowerCase().replace(/\s+/g,'-'), title:title, classified:false, content:'' };
        } else if(cleanLine.startsWith('[SECRET]') && current){
            current.classified = true;
        } else if(current){
            current.content += cleanLine.trimStart() + '\n';
        }
    });

    if(current) sections.push(current);
    return sections;
}

/* Создание кнопок */
function buildNavigation(sections){
    navContainer.innerHTML = '';
    sections.forEach(section=>{
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.textContent = section.title.toUpperCase();
        btn.dataset.target = section.id;
        btn.addEventListener('click',()=> loadContent(section.id));
        navContainer.appendChild(btn);
    });
}

/* Загрузка контента */
function loadContent(key){
    const item = sectionsData.find(s=>s.id===key);
    if(!item) return;

    document.querySelectorAll('.nav-btn').forEach(btn=>{
        btn.classList.toggle('active', btn.dataset.target===key);
    });

    const classBadge = item.classified ? '<span class="classification">СЕКРЕТНО</span>' : '';

    contentDisplay.innerHTML = `<div class="section-title">${item.title}${classBadge}</div><div class="typewriter-text" id="tw"></div>`;

    const textElement = document.getElementById('tw');
    typeWriter(textElement, item.content.trim());
}

/* Typewriter */
function typeWriter(element, text){
    element.innerHTML = '';
    let htmlContent = text.replace(/\n/g,'<br>');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    let nodes = [];
    tempDiv.childNodes.forEach(node => nodes.push(node));

    let currentNodeIndex = 0, currentTextIndex = 0;
    const speed = 5;

    function typing(){
        if(currentNodeIndex >= nodes.length){
            const cursor = document.createElement('span');
            cursor.className='cursor-block';
            element.appendChild(cursor);
            return;
        }

        const node = nodes[currentNodeIndex];

        if(node.nodeType===1){
            const clone = node.cloneNode(true);
            element.appendChild(clone);
            currentNodeIndex++;
            currentTextIndex=0;
            setTimeout(typing,speed);
        } else if(node.nodeType===3){
            const textContent = node.textContent;
            if(currentTextIndex < textContent.length){
                element.appendChild(document.createTextNode(textContent[currentTextIndex]));
                currentTextIndex++;
                contentDisplay.scrollTop = contentDisplay.scrollHeight;
                setTimeout(typing,speed);
            } else {
                currentNodeIndex++;
                currentTextIndex=0;
                setTimeout(typing,speed);
            }
        } else {
            currentNodeIndex++;
            setTimeout(typing,speed);
        }
    }
    typing();
}