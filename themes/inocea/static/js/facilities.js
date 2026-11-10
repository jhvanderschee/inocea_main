// Faciliteit-kaart opent de specificaties in een dialog; sluiten met het kruisje, Escape of een klik ernaast.
document.querySelectorAll("ul.facilities > li").forEach(li => {
    const dialog = li.querySelector("dialog");
    li.querySelector(".card").addEventListener("click", () => dialog.showModal());
    dialog.querySelector(".close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", e => { if (e.target == dialog) dialog.close(); });
});
