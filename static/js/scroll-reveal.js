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

setupBigtext();

/*
    Uit de oude scroll-reveal.js, opgeschoond en op een sectie-class gezet.
    Uncommenten + de call eronder aanzetten wanneer je ze nodig hebt.
    Het origineel staat in git: git show HEAD:static/js/scroll-reveal.js

function setupLineReveal() {
    const
        nodes = [...document.querySelectorAll("section.has-lines .container > :is(h1, h2, h3, p, li)")],
        sections = [...document.querySelectorAll("section.has-lines")],
        stagger = .05,
        observer = new IntersectionObserver(onIntersect, {threshold: .15});

    if (!nodes.length) return;

    document.fonts.ready.then(() => {
        nodes.forEach(wrapLines);
        sections.forEach(section => observer.observe(section));
    });

    function wrapLines(node) {
        const lines = node.querySelector("a, strong, em, br") ? [node.innerHTML] : measureLines(node);
        node.innerHTML = lines.map(line => `<span class="line"><span>${line}</span></span>`).join("");
        node.querySelectorAll(".line > span").forEach((line, i) => line.style.setProperty("--delay", `${i * stagger}s`));
    }

    function measureLines(node) {
        const range = document.createRange(), walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT), lines = [];
        let lastTop = null;
        while (walker.nextNode()) {
            const text = walker.currentNode;
            for (let i = 0; i < text.length; i++) {
                range.setStart(text, i);
                range.setEnd(text, i + 1);
                const top = Math.round(range.getBoundingClientRect().top);
                if (lastTop === null || Math.abs(top - lastTop) > 2) {lines.push(""); lastTop = top;}
                lines[lines.length - 1] += text.textContent[i];
            }
        }
        return lines.map((line, i) => i < lines.length - 1 ? line.replace(/\s+$/, "") : line);
    }

    function onIntersect(entries) {
        entries.filter(entry => entry.isIntersecting).forEach(entry => {
            entry.target.dataset.revealed = true;
            observer.unobserve(entry.target);
        });
    }
}

function setupFadeReveal() {
    const
        sections = [...document.querySelectorAll("section.has-fade")],
        stagger = .05,
        observer = new IntersectionObserver(onIntersect, {threshold: .15});

    if (!sections.length) return;

    sections.forEach(section => {
        [...section.querySelectorAll(".container > *")].forEach((node, i) => node.style.setProperty("--delay", `${i * stagger}s`));
        observer.observe(section);
    });

    function onIntersect(entries) {
        entries.filter(entry => entry.isIntersecting).forEach(entry => {
            entry.target.dataset.revealed = true;
            observer.unobserve(entry.target);
        });
    }
}

setupLineReveal();
setupFadeReveal();
*/
