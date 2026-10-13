const countDelay = 150;
const countDuration = 1000;
const magnitudes = { K: 1e3, M: 1e6, B: 1e9 };

// "$1B", "2,400", "300,000+": het getal met komma's en K/M/B; voor- en achtervoegsel blijven staan.
function parseCount(text) {
    const match = text.match(/(\d[\d,]*(?:\.\d+)?)\s*([KMB]?)/);
    if (!match) return null;
    const [token, digits, magnitude] = match;
    return {
        token,
        value: parseFloat(digits.replace(/,/g, '')) * (magnitudes[magnitude] || 1),
        decimals: (digits.split('.')[1] || '').length,
        commas: digits.includes(','),
        magnitude
    };
}

function formatCount(value, count) {
    if (count.magnitude) {
        const unit = ['B', 'M', 'K'].find(k => value >= magnitudes[k]);
        return unit ? Math.min(999, Math.floor(value / magnitudes[unit])) + unit : String(Math.floor(value));
    }
    const factor = Math.pow(10, count.decimals);
    return (Math.floor(value * factor) / factor).toLocaleString('en-US', { minimumFractionDigits: count.decimals, maximumFractionDigits: count.decimals, useGrouping: count.commas });
}

function countUp(element, count) {
    // Met K/M/B eerst snel naar 90%, dan rustig door de laatste stap, zodat je $900M-$999M ziet.
    const valueAt = p => !count.magnitude ? count.value * p
        : p < .6 ? count.value * .9 * p / .6 : count.value * (.9 + .099 * (p - .6) / .4);
    const start = performance.now();
    const step = now => {
        const p = Math.min(1, (now - start) / countDuration);
        element.textContent = p < 1 ? formatCount(valueAt(p), count) : count.token;
        if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

document.addEventListener('DOMContentLoaded', function() {
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            const count = parseCount(entry.target.innerText);
            if (!count) return;
            entry.target.innerHTML = entry.target.innerHTML.replace(count.token, `<span class="countup-target">${count.token}</span>`);
            const countUpTarget = entry.target.querySelector('.countup-target');
            countUpTarget.textContent = formatCount(0, count);
            setTimeout(() => countUp(countUpTarget, count), countDelay);
        });
    });
    document.querySelectorAll('.countup').forEach(function(element) {
        observer.observe(element);
    });
});
