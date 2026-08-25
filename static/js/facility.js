(function setupFacility() {
    const
        div = document.querySelector("div.facility"),
        buttons = div.querySelectorAll("button[data-for]"),
        captions = div.querySelectorAll("li[data-for]"),
        dirButtons = div.querySelectorAll("button[data-dir]");

    dirButtons.forEach(button => button.addEventListener("click", () => cycle(button.dataset.dir)));
    buttons.forEach(button => button.addEventListener("click", () => click(button)))

    function cycle(dir) {
        const activeButton = [...buttons].find(d => d.classList.contains("active"));
        (dir > 0) ?
            (activeButton.parentNode.nextElementSibling?.querySelector("button") || buttons[0]).click()
            :
            (activeButton.parentNode.previousElementSibling?.querySelector("button") || buttons[buttons.length - 1]).click();
    }

    function click(targetButton) {
        [captions, buttons].forEach(array => array.forEach(el => el.classList.toggle("active", el.dataset.for == targetButton.dataset.for)));
    }
})();