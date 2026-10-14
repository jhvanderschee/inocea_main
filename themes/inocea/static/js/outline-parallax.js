// Contourbeelden (.ship-outline) schuiven trager mee met scrollen; JS i.p.v. scroll-timeline zodat het ook in Firefox werkt.
function setupOutlineParallax() {
    const
        speed = -.15,
        items = [...document.querySelectorAll("img.ship-outline")].map(el => ({ el, section: el.closest("section") }));

    if (!items.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const render = () => items.forEach(({ el, section }) => {
        const box = section.getBoundingClientRect();
        if (box.bottom < 0 || box.top > innerHeight) return;
        el.style.translate = `0 ${box.top / innerHeight * speed * box.height}px`;
    });

    window.addEventListener("scroll", () => requestAnimationFrame(render), { passive: true });
    render();
}

setupOutlineParallax();
