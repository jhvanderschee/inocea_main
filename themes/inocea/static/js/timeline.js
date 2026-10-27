// Tijdlijn: pijlen scrollen een jaar verder; aan het eind springt de pijl terug naar het begin.
function setupTimeline() {
    document.querySelectorAll("div.timeline").forEach(timeline => {
        const
            slider = timeline.querySelector(".slider"),
            buttons = timeline.querySelectorAll(".arrow"),
            update = () => {
                const
                    threshold = 50,
                    right = slider.scrollWidth - slider.offsetWidth - slider.scrollLeft;
                timeline.dataset.scrollable = `${right > threshold ? "right" : ""}${slider.scrollLeft > threshold ? "left" : ""}`;
            };

        buttons.forEach(button => button.addEventListener("click", () => {
            const
                step = slider.querySelector("li").offsetWidth,
                scrollable = timeline.dataset.scrollable;

            if (scrollable === "right" && button.dataset.dir === "-1") slider.scrollTo(slider.scrollWidth, 0);
            else if (scrollable === "left" && button.dataset.dir === "1") slider.scrollTo(0, 0);
            else slider.scrollBy(step * button.dataset.dir, 0);
        }));

        slider.addEventListener("scroll", update);
        new ResizeObserver(update).observe(document.body);
        update();
    });
}
setupTimeline();
