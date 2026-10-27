function prepAccordions() {
    const accordions = document.querySelectorAll("ul.accordion");
    accordions.forEach((accordion, accordionNumber) => {
        const items = [...accordion.querySelectorAll(":scope > li")].map(d => { return { node: d, title: d.firstElementChild.innerHTML, tag: d.firstElementChild.tagName, content: nodeListToString(d.querySelectorAll(":scope > *:first-child ~ *")) } });
        items.forEach((item, itemNumber) => restructure(item, accordionNumber, itemNumber));
    });

    function restructure(item,accordionNumber, itemNumber) {
        const id = "accordion-" + accordionNumber + "-" + itemNumber;
        const open = item.node.hasAttribute("data-open");
        item.node.innerHTML = `<${item.tag}><button aria-expanded='${open}' aria-controls='${id}'>${item.title}</button></${item.tag}><div aria-hidden='${!open}' id='${id}'><div class='prose'>${item.content}</div></div>`
    }

    function nodeListToString(list) {
        return [...list].map(d => d.outerHTML).join(" ");
    }
}

function setAccordionInteraction() {
    const accordions = document.querySelectorAll("ul.accordion");
    accordions.forEach(parent => {
        const
            accordions = [...parent.querySelectorAll(":scope > li")].map(d => { return { node: d, button: d.querySelector("button"), content: d.querySelector("div[aria-hidden]") } }),
            openAccordion = accordion => {
                accordion.node.style.setProperty("--height", accordion.content.firstElementChild.offsetHeight + "px");
                accordion.button.ariaExpanded = true;
                accordion.content.ariaHidden = false;
            },
            closeAccordion = accordion => {
                accordion.node.style.setProperty("--height", accordion.content.firstElementChild.offsetHeight + "px");
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    accordion.node.style.setProperty("--height", "0");
                    accordion.button.ariaExpanded = false;
                    accordion.content.ariaHidden = true;
                }));
            },
            click = accordion => {
                if (!parent.classList.contains("multiple")) accordions.filter(d => d.button.ariaExpanded == "true").forEach(otherAccordion => closeAccordion(otherAccordion))
                accordion.button.ariaExpanded == "false" ? openAccordion(accordion) : closeAccordion(accordion)
            }

        accordions.forEach(accordion => {
            accordion.button.addEventListener("click", () => click(accordion))
            accordion.content.addEventListener("transitionend", () => accordion.node.style.removeProperty("--height"));
        });
    });
}

// Een link naar #id van een accordion-item klapt dat item open en scrollt erheen, onder de vaste header.
function openAccordionFromHash(hash, immediate) {
    const target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
    if (!target || !target.matches("ul.accordion > li")) return false;
    const
        button = target.querySelector("button[aria-expanded]"),
        offset = document.querySelector("header").offsetHeight + 14;
    if (button.ariaExpanded == "false") button.click();
    if (window.lenis) window.lenis.scrollTo(target, { offset: -offset, immediate });
    else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: immediate ? "auto" : "smooth" });
    return true;
}

function setupAccordions() {
    prepAccordions();
    setAccordionInteraction();
    document.querySelectorAll("a[href*='#']").forEach(a => a.addEventListener("click", e => {
        if (a.pathname == location.pathname && openAccordionFromHash(a.hash, false)) e.preventDefault();
    }));
    if (location.hash) document.fonts.ready.then(() => requestAnimationFrame(() => openAccordionFromHash(location.hash, true)));
    window.addEventListener("hashchange", () => openAccordionFromHash(location.hash, false));
}

if (document.querySelector("ul.accordion")) setupAccordions();