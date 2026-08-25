const countDelay = 150; //delay before starting countup in ms
const countDuration = 1000; //duration of countup in ms

function countUp(element) {
    var countUpTarget = element;
    var target = countUpTarget.parentElement.getAttribute('data-target');
    var decimalPlaces = 0;
    //if target contains a dot, parse as float
    if (target.indexOf('.') !== -1) {
        decimalPlaces = target.split('.')[1].length;
        target = Math.ceil(parseFloat(target)*Math.pow(10, decimalPlaces))/Math.pow(10, decimalPlaces);
        stepSize = 1/Math.pow(10,decimalPlaces);
    } else {
        target = parseInt(target);
        var stepSize = Math.ceil(target / 150);
    }
    let count = 0;
    const stepTime = Math.round((countDuration * stepSize) / target);
    const timer = setInterval(() => {
        count += stepSize;
        countUpTarget.innerText = Math.ceil(count*Math.pow(10, decimalPlaces))/Math.pow(10, decimalPlaces);
        if (count >= target) {
            clearInterval(timer);
            countUpTarget.innerText = countUpTarget.parentElement.getAttribute('data-target');
        }
    }, stepTime);
}
//run countup when dom is loaded and intersecting using IntersectionObserver
document.addEventListener('DOMContentLoaded', function() {
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                //find first number in string and allow for commas and dots
                var match = entry.target.innerText.match(/[-+]?[0-9]*\.?[0-9]+/);
                if (!match) {
                    observer.unobserve(entry.target);
                    return;
                }
                var target = match[0];
                //set data-target attribute
                entry.target.setAttribute('data-target', target);
                //wrap the target number in a span
                entry.target.innerHTML = entry.target.innerHTML.replace(target, `<span class="countup-target">${target}</span>`);
                var countUpTarget = entry.target.querySelector('.countup-target');
                //set initial value to 0 and start countup after delay
                countUpTarget.innerText = '0';
                setTimeout(() => countUp(countUpTarget), countDelay);
                observer.unobserve(entry.target);
            }
        });
    });
    document.querySelectorAll('.countup').forEach(function(element) {
        observer.observe(element);
    });
});