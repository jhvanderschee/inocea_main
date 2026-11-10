// Programma's: staat --programs-pin in de stijl aan, dan blijft de slider midden in beeld, met de secties ervoor en erna (samen in .programs-block, dat sticky staat),
// en schuift de scroll de kaarten door tot de laatste. Wat niet in beeld past steekt boven en onder uit. Een lege ruimte onder het blok,
// zo hoog als de verschuiving, maakt daar plaats voor; daarna scrolt de pagina verder.
function setupProgramsPin() {
    document.querySelectorAll("div.programs").forEach(div => {
        const
            items = [...div.querySelectorAll("li[data-for]")],
            buttons = [...div.querySelectorAll("button[data-for]")],
            section = div.closest("section"),
            parts = [section.previousElementSibling, section, section.nextElementSibling].filter(el => el?.tagName == "SECTION"),
            stage = document.createElement("div"),
            block = document.createElement("div"),
            room = document.createElement("div");

        let on = false, top = 0, step = 0, active = -1, queued = false;

        block.className = "programs-block";
        room.setAttribute("aria-hidden", "true");

        const
            // Het blok en de lege ruimte staan in een eigen stage: het blok staat sticky zolang de stage duurt.
            wrap = () => {
                parts[0].before(stage);
                block.append(...parts);
                stage.append(block, room);
            },
            unwrap = () => {
                stage.before(...parts);
                stage.remove();
            },
            show = i => {
                if (i == active) return;
                active = i;
                [items, buttons].forEach(array => array.forEach(el => el.classList.toggle("active", el.dataset.for == i)));
                buttons[i].closest("ul").scrollTo(buttons[i].offsetLeft, 0);
            },
            place = () => {
                if (!on) return;
                // Zonder sticky stond het blok direct boven de lege ruimte.
                const x = Math.min(step * (items.length - 1), Math.max(0, top - room.getBoundingClientRect().top + block.offsetHeight));
                div.style.setProperty("--x", x);
                show(Math.round(x / step));
            },
            measure = () => {
                const pin = getComputedStyle(div).getPropertyValue("--programs-pin").trim() == "1" && items.length > 1;
                if (pin != on) (on = pin) ? wrap() : unwrap();
                active = -1;
                step = on ? items[1].offsetLeft - items[0].offsetLeft : 0;
                room.style.height = on ? `${step * (items.length - 1)}px` : "";
                if (!on) return div.style.removeProperty("--x");
                // De slider midden in beeld (de header is weg tijdens het naar beneden scrollen); het blok mag boven het scherm beginnen,
                // maar schuift op als er anders boven of onder een lege rand in beeld komt die het blok had kunnen vullen.
                const
                    above = div.getBoundingClientRect().top - block.getBoundingClientRect().top,
                    over = innerHeight - block.offsetHeight;
                top = Math.min(Math.max(0, over), Math.max(Math.min(0, over), (innerHeight - div.offsetHeight) / 2 - above));
                block.style.setProperty("--top", `${top}px`);
                place();
            },
            go = i => {
                const y = stage.getBoundingClientRect().top + window.scrollY - top + Math.max(0, Math.min(items.length - 1, i)) * step;
                window.lenis ? window.lenis.scrollTo(y) : window.scrollTo({ top: y, behavior: "smooth" });
            };

        // Vast in beeld sturen nummers en pijlen de scroll, niet de switcher.
        div.addEventListener("click", e => {
            const button = on && e.target.closest("button[data-for], button[data-dir]");
            if (!button) return;
            e.stopPropagation();
            go(button.dataset.for ? +button.dataset.for : active + +button.dataset.dir);
        }, true);

        window.addEventListener("scroll", () => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => { queued = false; place(); });
        }, { passive: true });
        window.addEventListener("resize", measure);
        new ResizeObserver(() => on && measure()).observe(block);
        measure();
    });
}

setupProgramsPin();
