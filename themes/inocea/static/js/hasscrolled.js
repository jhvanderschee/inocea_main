let lastScrollY = window.scrollY;
let anchorScrollUntil = 0;

document.querySelectorAll("header nav a").forEach(function(a) {
    a.addEventListener("click", function(e) {
        const href = a.getAttribute("href");
        const hash = href && href.indexOf("#") !== -1 ? href.slice(href.indexOf("#")) : null;
        if (!hash) return;
        if (a.pathname && a.pathname !== window.location.pathname) return;
        const target = document.querySelector(hash);
        if (!target) return;
        const isTop = hash === "#top";
        const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
        const targetY = isTop ? 0 : target.getBoundingClientRect().top + window.scrollY - pad;
        anchorScrollUntil = Date.now() + 1500;
        if (targetY >= 50) document.body.classList.add("header-hidden");
        else document.body.classList.remove("header-hidden");
        if (window.lenis) {
            e.preventDefault();
            window.lenis.scrollTo(isTop ? 0 : hash, {offset: isTop ? 0 : -pad});
        }
    });
});

window.addEventListener("scroll", function() {
    const y = window.scrollY;
    if (y < 50) {
        document.body.classList.remove("header-hidden");
    } else if (Date.now() >= anchorScrollUntil) {
        if (y > lastScrollY + 5) document.body.classList.add("header-hidden");
        else if (y < lastScrollY - 5) document.body.classList.remove("header-hidden");
    }
    lastScrollY = y;
}, {passive: true});

function cancelAnchorScroll() {anchorScrollUntil = 0;}
window.addEventListener("wheel", cancelAnchorScroll, {passive: true});
window.addEventListener("touchmove", cancelAnchorScroll, {passive: true});
window.addEventListener("mousedown", cancelAnchorScroll, {passive: true});
