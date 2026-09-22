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

/*
    Line reveal — the opener daviedefense.com uses, ported from that site.

    Every line of copy is clipped by a box of its own and slides up from its
    base, a beat after the line above it. A line is wrapped as

        <span class="line-wrap"><span class="line-inner"> … </span></span>

    where the wrap does the clipping and the inner starts a full line-height
    low; `visible` on the section eases them all home on a stagger. See REVEAL
    in style.css for the half that moves.

    Lines are measured, not guessed: a Range walks the copy a character at a
    time and opens a new line wherever the top edge jumps, which is the only
    way to know where the browser actually broke it. That reads text nodes, so
    it would drop any `<strong>` or `<a>` it walked past — copy carrying inline
    markup is split on its `<br>`s instead, or left whole when it has none.

    Once a section has landed its wrappers come out again and the original
    html goes back verbatim, so what is left in the dom is the markup the page
    was written with: selectable, searchable, free of spans nobody needs.

    Sections land in document order, each waiting for the ones above it, so
    reading down the page never overtakes the animation.

    Below 1000px none of it runs. Measuring every character to animate it is
    not work worth doing on a phone, and the page is served plain there.
*/
function setupLineReveal() {
    const
        minWidth = 1000,
        lead = .15,
        stagger = .05,
        selector = "h1, h2, h3, p, li",
        /* Furniture that owns its own motion, or that would read badly sliced
           into lines: the word-by-word bigtext above, the tab strips, and the
           cards and carousels that move as a block. */
        skip = ".accordion, .tabs, div.crafts, div.facility, .curtain-carousel, ul.publications, ul.leadership",
        original = new WeakMap(),
        sections = [...document.querySelectorAll("main section")];

    if (window.innerWidth < minWidth || !sections.length) return;

    document.fonts.ready.then(() => {
        sections.forEach(prepare);
        /* One frame to lay the hidden state down, one to be sure it painted,
           and only then start moving — otherwise the first section is already
           home before the browser has drawn it anywhere else. */
        requestAnimationFrame(() => requestAnimationFrame(start));
    });

    function prepare(section) {
        [...section.querySelectorAll(selector)].filter(revealable).forEach(wrapLines);

        const lines = [...section.querySelectorAll(".line-inner")];

        lines.forEach((line, i) => {
            const delay = `${(lead + i * stagger).toFixed(2)}s`;
            line.style.setProperty("--delay", delay);
            /* A list marker is a pseudo-element on the `li`, outside the wrap
               that clips the text, so it needs the delay of its own line. */
            line.closest("li")?.style.setProperty("--delay", delay);
        });

        /* Photographs fade rather than slide: shoving a picture up out of a clip
           reads as a jolt at that size. Each lands a beat after the last line of
           copy above it, so the section still arrives top to bottom. `/uploads`
           is the content; `/img` is chrome — arrows, markers, diagrams — and it
           stays where it is. */
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
            /* Splitting by geometry would throw the markup away, so follow the
               line breaks the copy wrote by hand, or keep it in one piece. */
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
            /* A `<br>` is a line boundary the browser will not report as a
               jump in top edge, so force one and carry on. */
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
        /* A block contributes one `.line-wrap` per line, so the same node comes
           back several times; restore each one once, or the second pass reads a
           map entry the first already cleared. */
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
        /* Nothing overtakes the section above it; that one's hand-off will
           come back for this. */
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
