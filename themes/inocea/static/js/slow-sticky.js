// Zachte sticky: een sticky element met class slow-sticky remt bij aankomst (--aanloop) en tegen de bodem van zijn ouder (--uitloop) zacht af, in schermhoogtes.
// De knoppen staan in CSS op het element; 0 zet een zone uit. Het script schrijft translate, dus het element heeft zelf geen translate.
// Een element dat een ander script later maakt (het blok van js/programs.js) meldt zich met slowSticky(el); opnieuw aanroepen meet opnieuw.
// Meten gebeurt alleen bij een resize of een andere maat; per scroll wordt alleen de scrollpositie gelezen.
const slowStickies = new Map();
let slowStickyGemeten = false;

function setupSlowSticky() {
    const
        update = () => {
            if (!slowStickyGemeten) meetSlowStickies();
            slowStickies.forEach(updateSlowSticky);
        },
        opnieuw = () => { slowStickyGemeten = false; update(); };

    if (window.lenis) window.lenis.on("scroll", update);
    else window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", opnieuw);
    // Alles wat de pagina langer of korter maakt, verschuift ook de ouders.
    setupSlowSticky.kijker = new ResizeObserver(opnieuw);
    setupSlowSticky.kijker.observe(document.body);
    setupSlowSticky.update = update;
    document.querySelectorAll(".slow-sticky").forEach(slowSticky);
}

function slowSticky(el) {
    slowStickyGemeten = false;
    if (!slowStickies.has(el)) {
        const sticky = { el, ouder: el.parentElement, dichtbij: false, geschreven: null };
        slowStickies.set(el, sticky);
        setupSlowSticky.kijker.observe(el);
        setupSlowSticky.kijker.observe(sticky.ouder);
        // Alleen in de buurt van beeld rekenen, en alleen dan een eigen laag.
        new IntersectionObserver(entries => entries.forEach(entry => {
            sticky.dichtbij = entry.isIntersecting;
            el.style.willChange = sticky.dichtbij ? "translate" : "";
            setupSlowSticky.update();
        }), { rootMargin: "50% 0px" }).observe(sticky.ouder);
    }
    setupSlowSticky.update();
}

// Meet alle ouders tegelijk op hun plek zonder sticky en zonder translate, zodat ook een slow-sticky binnen een andere klopt.
function meetSlowStickies() {
    const lijst = [...slowStickies.values()].filter(sticky => sticky.el.isConnected);

    lijst.forEach(({ el }) => { el.style.position = "static"; el.style.translate = "none"; });
    lijst.forEach(sticky => {
        const
            stijl = getComputedStyle(sticky.el),
            knop = (naam, standaard) => {
                const waarde = parseFloat(stijl.getPropertyValue(naam));
                return isNaN(waarde) ? standaard : waarde;
            };
        sticky.ouderTop = sticky.ouder.getBoundingClientRect().top + window.scrollY;
        sticky.ouderHoogte = sticky.ouder.offsetHeight;
        sticky.hoogte = sticky.el.offsetHeight;
        sticky.aanloop = knop("--aanloop", 0);
        sticky.uitloop = knop("--uitloop", .6);
    });
    lijst.forEach(({ el }) => { el.style.position = ""; el.style.translate = ""; });
    lijst.forEach(sticky => {
        const stijl = getComputedStyle(sticky.el);
        sticky.aan = stijl.position == "sticky";
        sticky.rust = parseFloat(stijl.top) || 0;
        sticky.geschreven = null;
    });
    slowStickyGemeten = true;
}

function updateSlowSticky(sticky) {
    if (!sticky.dichtbij || !sticky.el.isConnected) return;
    let waarde = "";
    // Een element dat even hoog is als zijn ouder heeft geen ruimte om te bewegen.
    if (sticky.aan && sticky.ouderHoogte > sticky.hoogte) {
        const
            top = sticky.ouderTop - window.scrollY,
            bottom = top + sticky.ouderHoogte;
        waarde = `0 ${(stickyPositie(top, bottom, sticky.aanloop, sticky.uitloop, sticky.rust, sticky.hoogte) - stickyRust(top, bottom, sticky.rust, sticky.hoogte)).toFixed(1)}px`;
    }
    if (waarde !== sticky.geschreven) sticky.el.style.translate = sticky.geschreven = waarde;
}

// Waar het element staat met de rem: boven remt het af naar zijn rustpunt, onder tegen de bodem van de ouder.
function stickyPositie(top, bottom, aanloop, uitloop, rust, hoogte) {
    const
        laagste = bottom - hoogte,
        boven = rust + afremmen(top - rust, aanloop * innerHeight);

    return laagste - afremmen(laagste - boven, uitloop * innerHeight);
}

// Waar native sticky het element zet.
function stickyRust(top, bottom, rust, hoogte) {
    return Math.min(Math.max(rust, top), bottom - hoogte);
}

// Zachte overgang van x naar 0 over afstand: buiten de zone is het de harde max van native sticky.
function afremmen(x, afstand) {
    if (x >= afstand / 2) return x;
    if (x <= -afstand / 2) return 0;
    return (x + afstand / 2) ** 2 / (2 * afstand);
}

setupSlowSticky();
