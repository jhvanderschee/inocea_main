// Faciliteit-kaart opent de specificaties in een dialog; sluiten met het kruisje, Escape of een klik ernaast.
// Een hash van een faciliteit (#quebec-canada) opent de dialog ook, bij het laden en na een klik op een anker; sluiten haalt de hash weg.
// Sluiten wacht tot een uit-animatie (class closing) klaar is, als de stijl die heeft.
(() => {
    const facilities = [...document.querySelectorAll("ul.facilities > li")];

    facilities.forEach(li => {
        const dialog = li.querySelector("dialog");
        li.querySelector(".card").addEventListener("click", () => open(li));
        dialog.querySelector(".close").addEventListener("click", () => close(dialog));
        dialog.addEventListener("click", e => { if (e.target == dialog) close(dialog); });
        dialog.addEventListener("cancel", e => { e.preventDefault(); close(dialog); });
    });

    function open(li) {
        const dialog = li.querySelector("dialog");
        if (dialog.open) return;
        // Na het sluiten gaat de focus terug naar de kaart, niet naar het anker bovenaan; anders springt de pagina terug.
        li.querySelector(".card").focus({ preventScroll: true });
        dialog.classList.remove("closing");
        dialog.showModal();
        history.replaceState(null, "", "#" + li.id);
    }

    async function close(dialog) {
        if (!dialog.open || dialog.classList.contains("closing")) return;
        dialog.classList.add("closing");
        await Promise.all(dialog.getAnimations().map(animation => animation.finished.catch(() => {})));
        dialog.close();
        dialog.classList.remove("closing");
        history.replaceState(null, "", location.pathname + location.search);
    }

    function openFromHash() {
        const li = facilities.find(li => "#" + li.id == decodeURIComponent(location.hash));
        if (li) open(li);
    }

    window.addEventListener("hashchange", openFromHash);
    openFromHash();
})();
