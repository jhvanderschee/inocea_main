document.querySelectorAll('div.tabs').forEach(tabs => {
    const navLinks = tabs.querySelectorAll(':scope > .tabs-nav a');
    const tabContents = tabs.querySelectorAll(':scope > .tab-content');

    function setTabHeight() {
        const activeTab = tabs.querySelector(':scope > .tab-content.active');
        if (!activeTab) return;
        const activeHeight = activeTab.offsetHeight;
        if (!activeHeight) return;
        tabContents.forEach(tab => {
            const currentMinHeight = parseFloat(tab.style.minHeight) || 0;
            if (activeHeight > currentMinHeight) {
                tab.style.minHeight = activeHeight + 'px';
            }
        });
    }

    const ro = new ResizeObserver(setTabHeight);
    tabContents.forEach(c => ro.observe(c));

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            tabContents.forEach(c => { c.style.minHeight = ''; });
            setTabHeight();
        }, 150);
    });

    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const targetId = link.getAttribute('data-tab');
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            link.parentElement.classList.add('active');
            tabs.querySelector(`#${targetId}`).classList.add('active');
            setTabHeight();
        });
    });
});
