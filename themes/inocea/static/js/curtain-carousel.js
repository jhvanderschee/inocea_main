(function setupAllCarrousels() {
	const carrousels = document.querySelectorAll(".curtain-carousel");

	carrousels.forEach(figure => {
		const
			indicators = figure.querySelectorAll(".indicators button"),
			ul = figure.querySelector(".slider > ul"),
			images = ul.querySelectorAll("li"),
			texts = figure.querySelectorAll(".bottom ul li"),
			arrows = figure.querySelectorAll("button[data-dir]");

		let
			observer = new IntersectionObserver(update, { threshold: .51, root: ul }),
			curtainObserver = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) {entry.target.classList.add("in-view"); observer.unobserve(entry.target) }}, { threshold: .5 }),
			resizeObserver = new ResizeObserver(resize);

		images.forEach(image => observer.observe(image));
		curtainObserver.observe(figure);
		resizeObserver.observe(ul)

		arrows.forEach(arrow => {
			const dir = parseInt(arrow.dataset.dir);
			arrow.addEventListener("click", () => {
				ul.scrollBy(figure.offsetWidth * dir, 0);
			});
		});

		function resize() {
			const
				getHighest = (accumulator, current) => { return current.offsetHeight > accumulator.offsetHeight ? current : accumulator },
				highestText = [...texts].reduce(getHighest);
			texts[0].parentNode.style.setProperty("--min-height", highestText.offsetHeight + "px");
		}


		// Voorkomt horizontaal scroll-gejitter op trackpads.
		if (window.lenis)
			ul.addEventListener('wheel', (e) => {
				if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
					e.stopPropagation();
				}
			}, { passive: false });

		ul.addEventListener("scroll", () => {
			figure.dataset.pos = ul.scrollLeft < 20 ? "left" : ul.scrollWidth - ul.offsetWidth - ul.scrollLeft < 20 ? "right" : "middle"
		})

		indicators.forEach((indicator, i) => indicator.addEventListener("click", () => {
			ul.scrollTo(images[i].offsetLeft + images[i].offsetWidth / 2, 0)
		}));


		function update(entries) {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const targetIndex = ([...images].indexOf(entry.target));
					indicators.forEach((indicator, i) => indicator.dataset.active = i == targetIndex);
					texts.forEach((text, i) => text.dataset.active = i == targetIndex);
				}
			})
		}

	});
})();