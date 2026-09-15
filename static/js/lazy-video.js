// Video's pas ophalen als ze in beeld komen, en niet voordat de pagina helemaal
// geladen is, zodat ze niet om bandbreedte concurreren met CSS, fonts en posters.
// De poster blijft zichtbaar tot de video kan spelen.
function setupLazyVideo() {
    // Wie om minder beweging of databesparing vraagt, krijgt alleen de poster.
    if (navigator.connection?.saveData || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const
        videos = document.querySelectorAll("video:has(> source[data-src])"),
        startVideo = video => {
            video.querySelectorAll("source[data-src]").forEach(source => source.src = source.dataset.src);
            video.addEventListener("canplay", () => video.play(), { once: true });
            video.load();
        },
        observer = new IntersectionObserver(entries => entries.filter(entry => entry.isIntersecting).forEach(entry => {
            observer.unobserve(entry.target);
            startVideo(entry.target);
        }), { rootMargin: "200px 0px" }),
        observeVideos = () => videos.forEach(video => observer.observe(video));

    if (!videos.length) return;

    if (document.readyState === "complete") observeVideos();
    else window.addEventListener("load", observeVideos, { once: true });
}

setupLazyVideo();
