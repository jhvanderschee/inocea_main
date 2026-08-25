// document.fonts.ready.then(function () {
//   var sections = document.querySelectorAll('section');

//   if (window.innerWidth < 1000) return;

//   function wrapLines(section) {
//     if (section.classList.contains('page')) return;
//     var elements = section.querySelectorAll('h1, h2:not(.accordion h2), h3:not(.accordion h3), p:not(:has(img)):not(.accordion p):not(.bigtext p), li:not(.tabs-nav li):not(.accordion li):not(.carousel li):not(.leadership li)');
//     elements.forEach(function (el) {
//       const excludeIfClosests = [".facility", ".curtain-carousel"]
//       if (el.querySelector('.line-wrap')) return;
//       if (el.closest(excludeIfClosests)) return;

//       var text = el.innerHTML;
//       var hasInlineHTML = el.querySelector('a, strong, em, span, br');
//       var computed = getComputedStyle(el);
//       var lineHeight = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.5;
//       var totalHeight = el.scrollHeight;
//       var numLines = Math.round(totalHeight / lineHeight);

//       if (numLines <= 1 || hasInlineHTML) {
//         el.innerHTML = '<span class="line-wrap"><span class="line-inner">' + text + '</span></span>';
//       } else {
//         el.innerHTML = text;
//         var range = document.createRange();
//         var textNodes = [];
//         var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
//         while (walker.nextNode()) textNodes.push(walker.currentNode);

//         var lineGroups = [];
//         var lastTop = null;

//         textNodes.forEach(function (node) {
//           for (var i = 0; i < node.length; i++) {
//             range.setStart(node, i);
//             range.setEnd(node, i + 1);
//             var rect = range.getBoundingClientRect();
//             var top = Math.round(rect.top);
//             if (lastTop === null || Math.abs(top - lastTop) > 2) {
//               lineGroups.push('');
//               lastTop = top;
//             }
//             lineGroups[lineGroups.length - 1] += node.textContent[i];
//           }
//         });

//         if (lineGroups.length > 0) {
//           el.innerHTML = lineGroups.map(function (line, i) {
//             var trimmed = (i < lineGroups.length - 1) ? line.replace(/\s+$/, '') : line;
//             return '<span class="line-wrap"><span class="line-inner">' + trimmed + '</span></span>';
//           }).join('');
//         }
//       }
//     });
//   }

//   function unwrapLines(section) {
//     var elements = section.querySelectorAll('h1, h2:not(.accordion h2), h3:not(.accordion h3), p:not(.bigtext p):not(.accordion p), li:not(.accordion li):not(.carousel li):not(.leadership li)');
//     elements.forEach(function (el) {
//       var wraps = el.querySelectorAll('.line-wrap');
//       if (!wraps.length) return;
//       var text = '';
//       wraps.forEach(function (wrap, i) {
//         text += wrap.querySelector('.line-inner').innerHTML;
//         if (i < wraps.length - 1) text += ' ';
//       });
//       el.innerHTML = text;
//     });
//   }

//   function allPreviousVisible(section) {
//     var prev = section.previousElementSibling;
//     while (prev) {
//       if (prev.tagName === 'SECTION' && !prev.classList.contains('visible')) return false;
//       prev = prev.previousElementSibling;
//     }
//     return true;
//   }

//   function revealSection(section) {
//     if (!allPreviousVisible(section)) return;
//     section.classList.add('visible');
//     var lines = section.querySelectorAll('.line-inner:not(.bigtext .line-inner):not(.tabs .line-inner)');
//     var lastLine = lines[lines.length - 1];
//     if (lastLine) {
//       lastLine.addEventListener('transitionend', function () {
//         unwrapLines(section);
//         // After this section finishes, try to reveal the next one
//         var next = section.nextElementSibling;
//         while (next) {
//           if (next.tagName === 'SECTION' && !next.classList.contains('visible') && isInViewport(next)) {
//             revealSection(next);
//             break;
//           }
//           next = next.nextElementSibling;
//         }
//       }, { once: true });
//     }
//   }

//   function isInViewport(el) {
//     var rect = el.getBoundingClientRect();
//     return rect.top < window.innerHeight && rect.bottom > 0;
//   }

//   function isAboveViewport(el) {
//     return el.getBoundingClientRect().bottom < 0;
//   }

//   function revealInstant(section) {
//     section.classList.add('visible');
//     unwrapLines(section);
//   }

//   // Wrap lines, set stagger delays, and hide all sections
//   sections.forEach(function (section) {
//     wrapLines(section);
//     var lines = section.querySelectorAll('.line-inner:not(.bigtext .line-inner):not(.tabs .line-inner)');
//     lines.forEach(function (line, i) {
//       var delay = (0.15 + i * 0.05) + 's';
//       line.style.setProperty('--delay', delay);
//       if (line.closest('li')) {
//         line.closest('li').style.setProperty('--delay', delay);
//       }
//     });
//     if (section.classList.contains('page')) {
//       section.querySelector('.container').classList.add('fade-in');
//     }
//     var lastLineDelay = lines.length ? 0.15 + (lines.length - 1) * 0.05 : 0;
//     var fadeElements = section.querySelectorAll('img:not(.parallax.inline img), .parallax.inline, .input-group');
//     var groupCounts = {};
//     fadeElements.forEach(function (el) {
//       el.classList.add('fade-in');
//       var precedingCount = 0;
//       lines.forEach(function (line) {
//         if (line.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) {
//           precedingCount++;
//         }
//       });
//       var groupIndex = groupCounts[precedingCount] || 0;
//       groupCounts[precedingCount] = groupIndex + 1;
//       var delay = 0.15 + precedingCount * 0.05 + 0.05 + groupIndex * 0.05;
//       el.style.setProperty('--delay', delay + 's');
//     });
//     var numberItems = section.querySelectorAll('.accordion > li');
//     numberItems.forEach(function (el, i) {
//       el.classList.add('fade-in');
//       el.style.setProperty('--delay', (lastLineDelay + 0.1 + i * 0.1) + 's');
//     });
//     section.classList.add('reveal');
//   });

//   // Wrap bigtext words for scroll-based color reveal
//   var bigtextWords = [];
//   document.querySelectorAll('.bigtext p').forEach(function (p) {
//     var words = p.textContent.split(/\s+/).filter(function (w) { return w; });
//     p.innerHTML = words.map(function (word) {
//       return '<span class="bigtext-word">' + word + '</span>';
//     }).join(' ');
//   });
//   document.querySelectorAll('.bigtext').forEach(function (bt) {
//     var words = bt.querySelectorAll('.bigtext-word');
//     if (words.length) bigtextWords.push({ el: bt, words: Array.from(words) });
//   });

//   // Bigtext color transition word-by-word based on scroll position
//   var vh = window.innerHeight;
//   function updateBigtext() {
//     bigtextWords.forEach(function (group) {
//       var rect = group.el.getBoundingClientRect();
//       var style = getComputedStyle(group.el);
//       var padTop = parseFloat(style.paddingTop) || 0;
//       var top = rect.top + padTop;
//       // progress: 0 when content top is at 60% of viewport, 1 when at 20%
//       var progress = (vh * 0.6 - top) / (vh * 0.4);
//       progress = Math.max(0, Math.min(1, progress));
//       var activeCount = Math.round(progress * group.words.length);
//       group.words.forEach(function (word, i) {
//         word.style.color = i < activeCount ? '#f5f5f5' : '';
//       });
//     });
//   }
//   window.addEventListener('scroll', updateBigtext, { passive: true });
//   window.addEventListener('resize', function () { vh = window.innerHeight; }, { passive: true });
//   updateBigtext();

//   // Observer for sections that scroll into view later
//   var observer = new IntersectionObserver(function (entries) {
//     entries.forEach(function (entry) {
//       if (entry.isIntersecting) {
//         revealSection(entry.target);
//       }
//     });
//   }, { threshold: 0.15 });

//   // Wait for the hidden state to paint, then reveal already-visible sections
//   // and start observing the rest
//   requestAnimationFrame(function () {
//     requestAnimationFrame(function () {
//       sections.forEach(function (section) {
//         if (isAboveViewport(section)) {
//           revealInstant(section);
//         } else if (isInViewport(section)) {
//           revealSection(section);
//         } else {
//           observer.observe(section);
//         }
//       });
//     });
//   });
// });
