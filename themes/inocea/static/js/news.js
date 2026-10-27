// Nieuwslijst met data-show: alleen de eerste kaarten tonen tot iemand op de knop klikt.
function setupNewsMore() {
    document.querySelectorAll("ul.news[data-show]").forEach(list => {
        const
            hidden = [...list.children].slice(+list.dataset.show),
            more = list.nextElementSibling;
        if (!hidden.length) return more.remove();
        hidden.forEach(item => item.hidden = true);
        more.querySelector("button").addEventListener("click", () => {
            hidden.forEach(item => item.hidden = false);
            more.remove();
        });
    });
}
setupNewsMore();
