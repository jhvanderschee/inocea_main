// Programma's: staat --programs-pin in de stijl aan, dan blijft de slider midden in beeld en schuift de scroll de kaarten door tot de laatste.
// Een lege ruimte onder de slider, zo hoog als de verschuiving, maakt daar plaats voor; daarna scrolt de pagina verder.
function setupProgramsPin() {
    document.querySelectorAll("div.programs").forEach(div => {
        const
            items = [...div.querySelectorAll("li[data-for]")],
            buttons = [...div.querySelectorAll("button[data-for]")],
            pin = document.createElement("div"),
            room = document.createElement("div");

        let on = false, top = 0, step = 0, active = -1, queued = false;

        pin.className = "pin";
        room.setAttribute("aria-hidden", "true");
        pin.append(...div.children);
        div.append(pin, room);

        const
            // Scrollpositie waarop de slider gaat vastzitten: hij staat dan midden in beeld.
            start = () => room.getBoundingClientRect().top + window.scrollY - pin.offsetHeight - top,
            show = i => {
                if (i == active) return;
                active = i;
                [items, buttons].forEach(array => array.forEach(el => el.classList.toggle("active", el.dataset.for == i)));
                buttons[i].closest("ul").scrollTo(buttons[i].offsetLeft, 0);
            },
            place = () => {
                if (!on) return;
                const x = Math.min(step * (items.length - 1), Math.max(0, window.scrollY - start()));
                div.style.setProperty("--x", x);
                show(Math.round(x / step));
            },
            measure = () => {
                on = getComputedStyle(div).getPropertyValue("--programs-pin").trim() == "1" && items.length > 1;
                active = -1;
                step = on ? items[1].offsetLeft - items[0].offsetLeft : 0;
                top = (window.innerHeight - pin.offsetHeight) / 2;
                div.style.setProperty("--top", `${top}px`);
                room.style.height = on ? `${step * (items.length - 1)}px` : "";
                if (!on) div.style.removeProperty("--x");
                place();
            },
            go = i => {
                const y = start() + Math.max(0, Math.min(items.length - 1, i)) * step;
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
        window.addEventListener("load", measure);
        measure();
    });
}

setupProgramsPin();
