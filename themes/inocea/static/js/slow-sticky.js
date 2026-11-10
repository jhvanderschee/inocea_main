// Zachte sticky: een sticky element met class slow-sticky remt bij aankomst (--aanloop) en tegen de bodem van zijn ouder (--uitloop) zacht af, in schermhoogtes.
// De knoppen staan in CSS op het element; 0 zet een zone uit. Het script schrijft translate, dus het element heeft zelf geen translate.
function setupSlowSticky() {
    const
        aanloopStandaard = 0,
        uitloopStandaard = .6;

    document.querySelectorAll(".slow-sticky").forEach(el => {
        const ouder = el.parentElement;
        let aan = false, aanloop = 0, uitloop = 0, rust = 0, hoogte = 0, ouderHoogte = 0, gemeten = false, dichtbij = true, geschreven = null;

        const
            knop = (naam, standaard) => {
                const waarde = parseFloat(getComputedStyle(el).getPropertyValue(naam));
                return isNaN(waarde) ? standaard : waarde;
            },
            // Pas meten bij de eerste update, als alle stylesheets er zijn; daarna opnieuw na een resize.
            meet = () => {
                const stijl = getComputedStyle(el);
                aan = stijl.position == "sticky";
                aanloop = knop("--aanloop", aanloopStandaard);
                uitloop = knop("--uitloop", uitloopStandaard);
                rust = parseFloat(stijl.top) || 0;
                hoogte = el.offsetHeight;
                ouderHoogte = ouder.offsetHeight;
                gemeten = true;
            },
            update = () => {
                if (!dichtbij) return;
                if (!gemeten) meet();
                let waarde = "";
                // Een element dat even hoog is als zijn ouder heeft geen ruimte om te bewegen.
                if (aan && ouderHoogte > hoogte) {
                    const box = ouder.getBoundingClientRect();
                    waarde = `0 ${stickyPositie(box.top, box.bottom, aanloop, uitloop, rust, hoogte) - stickyRust(box, rust, hoogte)}px`;
                }
                if (waarde !== geschreven) el.style.translate = geschreven = waarde;
            },
            kijker = new ResizeObserver(() => { gemeten = false; update(); });

        if (window.lenis) window.lenis.on("scroll", update);
        else window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", () => { gemeten = false; update(); });
        kijker.observe(ouder);
        kijker.observe(el);
        new IntersectionObserver(entries => entries.forEach(entry => {
            dichtbij = entry.isIntersecting;
            update();
        }), { rootMargin: "50% 0px" }).observe(ouder);
    });
}

// Waar het element staat met de rem: boven remt het af naar zijn rustpunt, onder tegen de bodem van de ouder.
function stickyPositie(top, bottom, aanloop, uitloop, rust, hoogte) {
    const
        laagste = bottom - hoogte,
        boven = rust + afremmen(top - rust, aanloop * innerHeight);

    return laagste - afremmen(laagste - boven, uitloop * innerHeight);
}

// Waar native sticky het element zet.
function stickyRust(box, rust, hoogte) {
    return Math.min(Math.max(rust, box.top), box.bottom - hoogte);
}

// Zachte overgang van x naar 0 over afstand: buiten de zone is het de harde max van native sticky.
function afremmen(x, afstand) {
    if (x >= afstand / 2) return x;
    if (x <= -afstand / 2) return 0;
    return (x + afstand / 2) ** 2 / (2 * afstand);
}

setupSlowSticky();
