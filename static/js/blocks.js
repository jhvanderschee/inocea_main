(() => {
    const blocks = document.querySelectorAll("ul.blocks > li");
    blocks.forEach(block => {
        const
            leaveOutOfDiv = [""],
            rest = block.querySelectorAll(":scope > :not(h3:first-child, picture.background");

        block.addEventListener("click", () => blocks.forEach(otherBlocks => otherBlocks.classList.toggle("active", otherBlocks == block)));

        if (!rest.length) return;
        const
            div = document.createElement("div"),
            inner = div.appendChild(document.createElement("div"));
        rest.forEach(el => inner.appendChild(el));
        block.appendChild(div);
    });
})();
