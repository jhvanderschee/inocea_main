// Getallen in .countup tellen op zodra ze in beeld komen: "$1B", "2,400", "300,000+"; voor- en achtervoegsel blijven staan.
function setupCountup() {
    const
        delay = 150,
        duration = 1000,
        magnitudes = { K: 1e3, M: 1e6, B: 1e9 },
        observer = new IntersectionObserver(entries => entries.filter(entry => entry.isIntersecting).forEach(entry => {
            observer.unobserve(entry.target);
            start(entry.target);
        }));

    document.querySelectorAll(".countup").forEach(node => observer.observe(node));

    function parse(text) {
        const match = text.match(/(\d[\d,]*(?:\.\d+)?)\s*([KMB]?)/);
        if (!match) return null;
        const [token, digits, magnitude] = match;
        return {
            token,
            value: parseFloat(digits.replace(/,/g, "")) * (magnitudes[magnitude] || 1),
            decimals: (digits.split(".")[1] || "").length,
            commas: digits.includes(","),
            magnitude
        };
    }

    function format(value, count) {
        if (count.magnitude) {
            const unit = ["B", "M", "K"].find(key => value >= magnitudes[key]);
            return unit ? Math.min(999, Math.floor(value / magnitudes[unit])) + unit : String(Math.floor(value));
        }
        const factor = Math.pow(10, count.decimals);
        return (Math.floor(value * factor) / factor).toLocaleString("en-US", { minimumFractionDigits: count.decimals, maximumFractionDigits: count.decimals, useGrouping: count.commas });
    }

    function start(node) {
        const count = parse(node.innerText);
        if (!count) return;
        node.innerHTML = node.innerHTML.replace(count.token, `<span class="countup-target">${count.token}</span>`);
        const target = node.querySelector(".countup-target");
        target.textContent = format(0, count);
        setTimeout(() => countUp(target, count), delay);
    }

    // Met K/M/B eerst snel naar 90%, dan rustig door de laatste stap, zodat je $900M-$999M ziet.
    function countUp(target, count) {
        const
            begin = performance.now(),
            valueAt = p => !count.magnitude ? count.value * p : p < .6 ? count.value * .9 * p / .6 : count.value * (.9 + .099 * (p - .6) / .4),
            step = now => {
                const p = Math.min(1, (now - begin) / duration);
                target.textContent = p < 1 ? format(valueAt(p), count) : count.token;
                if (p < 1) requestAnimationFrame(step);
            };

        requestAnimationFrame(step);
    }
}

setupCountup();
