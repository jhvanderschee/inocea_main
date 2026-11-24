function setupBigtext() {
    const
        nodes = [...document.querySelectorAll("section.has-bigtext .container > p:not(:has(img)), div.bigtext > p:not(:has(img))")],
        bigtexts = nodes.map(node => ({ node, words: wrapWords(node) })).filter(bigtext => bigtext.words.length),
        from = .6,
        to = .2;

    let viewportHeight = window.innerHeight;

    if (!bigtexts.length) return;

    updateBigtext();
    window.addEventListener("scroll", updateBigtext, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    function wrapWords(node) {
        node.innerHTML = node.textContent.trim().split(/\s+/).map(word => `<span class="word">${word}</span>`).join(" ");
        return [...node.querySelectorAll(".word")];
    }

    function updateBigtext() {
        bigtexts.forEach(({ node, words }) => {
            const lit = Math.round(progress(node) * words.length);
            words.forEach((word, i) => word.dataset.lit = i < lit);
        });
    }

    function progress(node) {
        const top = node.getBoundingClientRect().top;
        return Math.min(1, Math.max(0, (viewportHeight * from - top) / (viewportHeight * (from - to))));
    }

    function handleResize() {
        viewportHeight = window.innerHeight;
        updateBigtext();
    }
}

/* Regel-voor-regel reveal-animatie; meet regels via Range, want alleen zo weet je waar de browser echt afbreekt. Draait niet onder 1000px. */
function setupLineReveal() {
    const
        minWidth = 1000,
        lead = .15,
        stagger = .05,
        selector = "h1, h2, h3, p, li",
        /* Elementen die zelf al bewegen of als blok horen te blijven, niet in regels knippen. */
        skip = ".accordion, .tabs, .has-crafts, div.facility, ul.facilities, div.programs, section.page-title, .curtain-carousel, ul.publications, ul.news, ul.leadership, .blocks, ul.numbers, .large-list, section.page, .timeline, .tiles, .steps, div.projects, .deliveries-browser, body.posts section",
        original = new WeakMap(),
        started = new WeakSet(),
        sections = [...document.querySelectorAll("main section")],
        observer = new IntersectionObserver(onIntersect, { threshold: .15 });

    // Geen line-reveal op legal-pagina's.
    if (window.innerWidth < minWidth || !sections.length || document.body.classList.contains("legal")) return;

    document.fonts.ready.then(() => {
        sections.forEach(prepare);
        /* Eerst laten tekenen, dan pas animeren, anders staat sectie 1 al goed voor je het ziet. */
        requestAnimationFrame(() => requestAnimationFrame(start));
    });

    function prepare(section) {
        [...section.querySelectorAll(selector)].filter(revealable).forEach(wrapLines);

        const
            lines = [...section.querySelectorAll(".line-inner")],
            /* Foto's en knoppen faden i.p.v. schuiven; /uploads is content, /img (chrome) blijft met rust.
               Accordion-items faden als blok, omdat hun inhoud niet in regels geknipt wordt. */
            faders = [
                ...section.querySelectorAll('img[src^="/uploads/"]'),
                ...[...section.querySelectorAll(".btn, ul.accordion > li")].filter(node => !node.parentElement.closest(skip) || node.matches("ul.accordion > li"))
            ];

        faders.forEach(node => node.classList.add("fade-in"));

        /* Volgorde op positie (boven naar onder, dan links naar rechts), niet op DOM-volgorde: een zijkolom komt anders als blok voor of na de hoofdtekst. */
        [...lines, ...faders]
            .map(node => ({ node, box: node.getBoundingClientRect() }))
            .sort((a, b) => Math.round(a.box.top) - Math.round(b.box.top) || a.box.left - b.box.left)
            .forEach(({ node }, i) => {
                const delay = `${(lead + i * stagger).toFixed(2)}s`;
                node.style.setProperty("--delay", delay);
                /* Lijst-marker zit buiten de clip-wrap en heeft dus zijn eigen delay nodig. */
                if (node.classList.contains("line-inner")) node.closest("li")?.style.setProperty("--delay", delay);
            });

        section.classList.add("reveal");
    }

    function revealable(node) {
        if (node.closest(skip)) return false;
        if (node.querySelector("img, video, iframe, .line-wrap")) return false;
        if (node.tagName === "P" && node.closest(".has-bigtext")) return false;
        return node.textContent.trim().length > 0;
    }

    function wrapLines(node) {
        const
            html = node.innerHTML,
            breaks = /<br\s*\/?>/i.test(html);

        original.set(node, html);

        if (!breaks && Math.round(node.scrollHeight / lineHeight(node)) <= 1) {
            node.innerHTML = wrap(html);
            return;
        }
        const lines = measureLines(node);
        if (lines.length) node.innerHTML = lines.map(wrap).join("");
    }

    function wrap(line) {
        return `<span class="line-wrap"><span class="line-inner">${line}</span></span>`;
    }

    function lineHeight(node) {
        const style = getComputedStyle(node);
        return parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5;
    }

    /* Geeft per regel de HTML terug. Knipt met een Range op de tekenposities waar de browser afbreekt;
       cloneContents sluit open tags netjes af, dus een link die over twee regels loopt blijft in beide regels een link. */
    function measureLines(node) {
        const
            range = document.createRange(),
            walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT),
            starts = [];

        let lastTop = null;

        while (walker.nextNode()) {
            const current = walker.currentNode;
            /* <br> geeft geen sprong in top-positie, dus forceer een nieuwe regel. */
            if (current.nodeType !== Node.TEXT_NODE) {
                if (current.tagName === "BR") lastTop = null;
                continue;
            }
            for (let i = 0; i < current.length; i++) {
                if (/\s/.test(current.data[i])) continue;
                range.setStart(current, i);
                range.setEnd(current, i + 1);
                const top = Math.round(range.getBoundingClientRect().top);
                if (lastTop === null || Math.abs(top - lastTop) > 2) starts.push([current, i]);
                lastTop = top;
            }
        }

        return starts.map(([container, offset], i) => {
            range.setStart(container, offset);
            if (starts[i + 1]) range.setEnd(...starts[i + 1]);
            else range.setEnd(node, node.childNodes.length);
            const holder = document.createElement("div");
            holder.append(range.cloneContents());
            holder.querySelectorAll("br").forEach(br => br.remove());
            return holder.innerHTML.trim();
        });
    }

    function unwrap(section) {
        /* Eén node levert meerdere .line-wraps op; herstel 'm daarom maar één keer. */
        new Set([...section.querySelectorAll(".line-wrap")].map(line => line.closest(selector)))
            .forEach(node => {
                if (!node || !original.has(node)) return;
                node.innerHTML = original.get(node);
                original.delete(node);
            });
        /* Knoppen en accordion-items krijgen hun eigen transitions (hover) terug. */
        section.querySelectorAll(".fade-in:not(img)").forEach(node => node.classList.remove("fade-in"));
    }

    function start() {
        sections.forEach(section => {
            if (above(section)) reveal(section, true);
            else if (onScreen(section)) reveal(section);
            else observer.observe(section);
        });
    }

    /* Pas unobserven als de sectie echt zichtbaar is; een sectie die te vroeg in beeld kwam moet later opnieuw kunnen triggeren. */
    function onIntersect(entries) {
        entries.filter(entry => entry.isIntersecting).forEach(entry => reveal(entry.target));
    }

    function reveal(section, instant) {
        if (section.classList.contains("visible")) return;
        /* Wacht tot de sectie erboven klaar is en het stokje doorgeeft. */
        if (!instant && !settled(section)) return;

        section.classList.add("visible");
        observer.unobserve(section);

        if (instant) {
            unwrap(section);
            started.add(section);
            return;
        }

        /* Laatste animatie-start in deze sectie; dan mag de volgende sectie beginnen, zodat de cascade van boven naar onder doorloopt. */
        const last = Math.max(0, ...[...section.querySelectorAll(".line-inner, .fade-in")].map(node => parseFloat(node.style.getPropertyValue("--delay")) || 0));

        /* Timers i.p.v. transitionend: die vuurt niet bij reduced motion of een verborgen laatste regel, en dan stokt de hele keten. */
        setTimeout(() => {
            started.add(section);
            handOff();
        }, last * 1000);
        setTimeout(() => unwrap(section), (last + 1) * 1000);
    }

    /* Wat intussen voorbij gescrold is direct tonen, dan de eerstvolgende sectie in beeld laten animeren. */
    function handOff() {
        sections.filter(other => !other.classList.contains("visible") && above(other)).forEach(other => reveal(other, true));
        const next = sections.find(other => !other.classList.contains("visible") && onScreen(other));
        if (next) reveal(next);
    }

    /* 'visible' komt er direct bij de start op; 'started' pas als de hele sectie in gang is gezet. */
    function settled(section) {
        return sections
            .slice(0, sections.indexOf(section))
            .every(earlier => started.has(earlier));
    }

    function above(section) {
        return section.getBoundingClientRect().bottom < 0;
    }

    function onScreen(section) {
        const box = section.getBoundingClientRect();
        return box.top < window.innerHeight && box.bottom > 0;
    }
}

setupBigtext();
setupLineReveal();