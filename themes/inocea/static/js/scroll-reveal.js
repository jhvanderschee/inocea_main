function setupBigtext() {
    const
        nodes = [...document.querySelectorAll("section.has-bigtext .container > p")],
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
        skip = ".accordion, .tabs, div.crafts, div.facility, .curtain-carousel, ul.publications, ul.leadership, .blocks",
        original = new WeakMap(),
        sections = [...document.querySelectorAll("main section")];

    if (window.innerWidth < minWidth || !sections.length) return;

    document.fonts.ready.then(() => {
        sections.forEach(prepare);
        /* Eerst laten tekenen, dan pas animeren, anders staat sectie 1 al goed voor je het ziet. */
        requestAnimationFrame(() => requestAnimationFrame(start));
    });

    function prepare(section) {
        [...section.querySelectorAll(selector)].filter(revealable).forEach(wrapLines);

        const lines = [...section.querySelectorAll(".line-inner")];

        lines.forEach((line, i) => {
            const delay = `${(lead + i * stagger).toFixed(2)}s`;
            line.style.setProperty("--delay", delay);
            /* Lijst-marker zit buiten de clip-wrap en heeft dus zijn eigen delay nodig. */
            line.closest("li")?.style.setProperty("--delay", delay);
        });

        /* Foto's faden i.p.v. schuiven; /uploads is content, /img (chrome) blijft met rust. */
        [...section.querySelectorAll('img[src^="/uploads/"]')].forEach(image => {
            const above = lines.filter(line => line.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_FOLLOWING).length;
            image.classList.add("fade-in");
            image.style.setProperty("--delay", `${(lead + (above + 1) * stagger).toFixed(2)}s`);
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
            breaks = /<br\s*\/?>/i.test(html),
            inline = !!node.querySelector("a, strong, em, span");

        original.set(node, html);

        if (inline) {
            /* Bij inline opmaak knippen op <br>, anders gaat de opmaak verloren bij regel-meting. */
            node.innerHTML = html.split(/<br\s*\/?>/i).map(wrap).join("");
            return;
        }
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

    function measureLines(node) {
        const
            range = document.createRange(),
            walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT),
            lines = [];

        let lastTop = null;

        while (walker.nextNode()) {
            const current = walker.currentNode;
            /* <br> geeft geen sprong in top-positie, dus forceer een nieuwe regel. */
            if (current.nodeType !== Node.TEXT_NODE) {
                if (current.tagName === "BR") lastTop = null;
                continue;
            }
            for (let i = 0; i < current.length; i++) {
                range.setStart(current, i);
                range.setEnd(current, i + 1);
                const top = Math.round(range.getBoundingClientRect().top);
                if (lastTop === null || Math.abs(top - lastTop) > 2) {
                    lines.push("");
                    lastTop = top;
                }
                lines[lines.length - 1] += current.textContent[i];
            }
        }
        return lines.map((line, i) => i < lines.length - 1 ? line.replace(/\s+$/, "") : line);
    }

    function unwrap(section) {
        /* Eén node levert meerdere .line-wraps op; herstel 'm daarom maar één keer. */
        new Set([...section.querySelectorAll(".line-wrap")].map(line => line.closest(selector)))
            .forEach(node => {
                if (!node || !original.has(node)) return;
                node.innerHTML = original.get(node);
                original.delete(node);
            });
    }

    function start() {
        const observer = new IntersectionObserver(onIntersect, { threshold: .15 });

        sections.forEach(section => {
            if (above(section)) reveal(section, true);
            else if (onScreen(section)) reveal(section);
            else observer.observe(section);
        });

        function onIntersect(entries) {
            entries.filter(entry => entry.isIntersecting).forEach(entry => {
                reveal(entry.target);
                observer.unobserve(entry.target);
            });
        }
    }

    function reveal(section, instant) {
        if (section.classList.contains("visible")) return;
        /* Wacht tot de sectie erboven klaar is en het stokje doorgeeft. */
        if (!instant && !settled(section)) return;

        section.classList.add("visible");

        const last = [...section.querySelectorAll(".line-inner")].pop();
        if (instant || !last) return unwrap(section);

        last.addEventListener("transitionend", () => {
            unwrap(section);
            const next = sections.find(other => !other.classList.contains("visible") && onScreen(other));
            if (next) reveal(next);
        }, { once: true });
    }

    function settled(section) {
        return sections
            .slice(0, sections.indexOf(section))
            .every(earlier => earlier.classList.contains("visible"));
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
