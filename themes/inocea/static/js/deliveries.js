// Opleveringen: filteren op categorie; op mobiel per acht rijen met "Load more" (breekpunt gelijk aan de CSS).
function setupDeliveries() {
    const
        page = 8,
        mobile = window.matchMedia("(max-width: 768px)");

    document.querySelectorAll("[data-deliveries]").forEach(browser => {
        const
            buttons = browser.querySelectorAll(".deliveries-filters button"),
            rows = browser.querySelectorAll("tbody tr"),
            shown = browser.querySelector("[data-deliveries-shown]"),
            body = browser.querySelector("tbody"),
            more = browser.querySelector(".deliveries-more");
        let
            filter = "all",
            limit = page;

        const render = () => {
            let matched = 0, last = null;
            rows.forEach(row => {
                const match = filter === "all" || row.dataset.category === filter;
                if (match) matched++;
                row.hidden = !(match && (!mobile.matches || matched <= limit));
                row.classList.remove("last");
                if (!row.hidden) last = row;
            });
            last?.classList.add("last");
            shown.textContent = matched;
            more.hidden = !mobile.matches || matched <= limit;
        };

        buttons.forEach(button => button.addEventListener("click", () => {
            filter = button.dataset.filter;
            limit = page;
            buttons.forEach(other => {
                other.classList.toggle("active", other === button);
                other.setAttribute("aria-pressed", other === button);
            });
            render();
            body.scrollTop = 0;
        }));
        more.querySelector("button").addEventListener("click", () => { limit += page; render(); });
        mobile.addEventListener("change", () => { limit = page; render(); });
        render();
    });
}
setupDeliveries();
