// Eén item tegelijk actief: knoppen met data-for kiezen een item, knoppen met
// data-dir bladeren erdoorheen. Gedeeld door de facility-kaart en de crafts.
function setupSwitchers() {
    document.querySelectorAll("div.facility, div.crafts").forEach(div => {
        const
            buttons = div.querySelectorAll("button[data-for]"),
            items = div.querySelectorAll("li[data-for]"),
            dirButtons = div.querySelectorAll("button[data-dir]"),
            click = targetButton => { targetButton.closest("ul").scrollTo(targetButton.offsetLeft, 0); console.log(targetButton.offsetLeft); [items, buttons].forEach(array => array.forEach(el => el.classList.toggle("active", el.dataset.for == targetButton.dataset.for))) },
            cycle = dir => {
                const activeButton = [...buttons].find(d => d.classList.contains("active"));
                (dir > 0) ?
                    (activeButton.parentNode.nextElementSibling?.querySelector("button") || buttons[0]).click()
                    :
                    (activeButton.parentNode.previousElementSibling?.querySelector("button") || buttons[buttons.length - 1]).click();
            };

        dirButtons.forEach(button => button.addEventListener("click", () => cycle(button.dataset.dir)));
        buttons.forEach(button => button.addEventListener("click", () => click(button)));
    });
}

setupSwitchers();
