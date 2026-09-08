(() => {
    const blocks = document.querySelectorAll("ul.blocks > li");
    blocks.forEach(block => {
        block.addEventListener("click", () => blocks.forEach(otherBlocks => otherBlocks.classList.toggle("active", otherBlocks == block)));
    });
})();
