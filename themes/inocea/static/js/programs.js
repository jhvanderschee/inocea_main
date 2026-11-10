// Programma's: staat --programs-pin in de stijl aan, dan blijft de slider midden in beeld, met de secties ervoor en erna (samen in .programs-block, dat sticky staat),
// en schuift de scroll de kaarten door tot de laatste. Wat niet in beeld past steekt boven en onder uit. Een lege ruimte onder het blok,
// zo hoog als de verschuiving, maakt daar plaats voor; daarna scrolt de pagina verder. Het blok is slow-sticky (js/slow-sticky.js):
// de verschuiving volgt de afgeremde plek van het blok, zodat ook het begin en einde zacht gaan.
function setupProgramsPin() {
    document.querySelectorAll("div.programs").forEach(div => {
        const
            items = [...div.querySelectorAll("li[data-for]")],
            row = div.querySelector(".tabbable-items"),
            buttons = [...div.querySelectorAll("button[data-for]")],
            section = div.closest("section"),
            parts = [section.previousElementSibling, section, section.nextElementSibling].filter(el => el?.tagName == "SECTION"),
            stage = document.createElement("div"),
            block = document.createElement("div"),
            room = document.createElement("div"),
            zacht = typeof slowSticky == "function";

        let on = false, top = 0, step = 0, shift = 0, stageTop = 0, height = 0, aanloop = 0, uitloop = 0, active = -1, x = null;

        block.className = "programs-block slow-sticky";
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
            // Alleen rekenen met de scrollpositie: hoever het blok (afgeremd) achterblijft bij waar het zonder sticky zou staan.
            place = () => {
                if (!on) return;
                const
                    natural = stageTop - window.scrollY,
                    pinned = zacht ? stickyPositie(natural, natural + height + shift, aanloop, uitloop, top, height) : Math.min(Math.max(top, natural), natural + shift),
                    next = Math.round(Math.min(shift, Math.max(0, pinned - natural)) * 10) / 10;
                if (next === x) return;
                x = next;
                // Direct op de rij, niet als custom property op de slider: dan hoeft alleen de rij opnieuw gestijld.
                row.style.translate = `${-x}px 0`;
                show(Math.round(x / step));
            },
            measure = () => {
                const pin = getComputedStyle(div).getPropertyValue("--programs-pin").trim() == "1" && items.length > 1;
                if (pin != on) (on = pin) ? wrap() : unwrap();
                active = -1;
                x = null;
                step = on ? items[1].offsetLeft - items[0].offsetLeft : 0;
                shift = step * (items.length - 1);
                room.style.height = on ? `${shift}px` : "";
                if (!on) return row.style.translate = "";
                // De slider midden in beeld (de header is weg tijdens het naar beneden scrollen); het blok mag boven het scherm beginnen,
                // maar schuift op als er anders boven of onder een lege rand in beeld komt die het blok had kunnen vullen.
                // Past de slider ook helemaal in beeld met het blok vanaf de bovenkant, dan blijft de sectie ervoor heel (een paginatitel).
                block.style.removeProperty("--aanloop");
                const
                    stijl = getComputedStyle(block),
                    above = div.getBoundingClientRect().top - block.getBoundingClientRect().top,
                    over = innerHeight - block.offsetHeight;
                height = block.offsetHeight;
                stageTop = stage.getBoundingClientRect().top + window.scrollY;
                aanloop = zacht ? parseFloat(stijl.getPropertyValue("--aanloop")) || 0 : 0;
                uitloop = zacht ? parseFloat(stijl.getPropertyValue("--uitloop")) || 0 : 0;
                top = Math.min(Math.max(0, over), Math.max(Math.min(0, over), (innerHeight - div.offsetHeight) / 2 - above));
                if (top < 0 && above + div.offsetHeight <= innerHeight) top = 0;
                block.style.setProperty("--top", `${top}px`);
                // De rem bij aankomst begint niet boven de bovenkant van de pagina, anders staat de rij bij het laden al verschoven.
                if (aanloop * innerHeight / 2 > stageTop - top) {
                    aanloop = Math.max(0, 2 * (stageTop - top) / innerHeight);
                    block.style.setProperty("--aanloop", aanloop);
                }
                if (zacht) slowSticky(block);
                place();
            },
            // Een nummer of pijl scrolt naar de plek van die kaart zonder rem; bij de eerste en de laatste staat de rij dan een fractie verschoven.
            go = i => {
                const y = stageTop - top + Math.max(0, Math.min(items.length - 1, i)) * step;
                window.lenis ? window.lenis.scrollTo(y) : window.scrollTo({ top: y, behavior: "smooth" });
            };

        // Vast in beeld sturen nummers en pijlen de scroll, niet de switcher.
        div.addEventListener("click", e => {
            const button = on && e.target.closest("button[data-for], button[data-dir]");
            if (!button) return;
            e.stopPropagation();
            go(button.dataset.for ? +button.dataset.for : active + +button.dataset.dir);
        }, true);

        if (window.lenis) window.lenis.on("scroll", place);
        else window.addEventListener("scroll", place, { passive: true });
        window.addEventListener("resize", measure);
        new ResizeObserver(() => on && measure()).observe(block);
        measure();
    });
}

// Na alle scripts, zodat js/slow-sticky.js er is.
document.addEventListener("DOMContentLoaded", setupProgramsPin);
