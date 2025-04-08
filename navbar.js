document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector("nav");
    
    // Only create effects if they don't already exist
    let effectEl = document.querySelector(".effect.filter");
    // Update the effect element creation to ensure proper styling
    if (!effectEl) {
        effectEl = document.createElement("span");
        effectEl.className = "effect filter";
        effectEl.style.pointerEvents = "none";
        effectEl.style.background = "transparent";
        document.body.appendChild(effectEl);
    }
    
    let textEl = document.querySelector(".effect.text");
    if (!textEl) {
        textEl = document.createElement("span");
        textEl.className = "effect text";
        textEl.style.pointerEvents = "none";
        textEl.style.background = "transparent";
        document.body.appendChild(textEl);
    }

    // Add scroll event listener to change navbar appearance
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
            textEl.style.opacity = '0';
            textEl.style.visibility = 'hidden';
        } else {
            nav.classList.remove('scrolled');
            if (textEl.classList.contains('active')) {
                textEl.style.opacity = '1';
                textEl.style.visibility = 'visible';
            }
        }
    });

    let animationTime = 600;
    let pCount = 15;
    const colors = [1,2,3,1,2,3,1,4];
    const timeVariance = 300;
    
    function noise(n = 1) {
        return n/2 - Math.random() * n;
    }
    
    function getXY(distance, pointIndex, totalPoints) {
        const x = (distance) * Math.cos(((360+noise(8))/totalPoints*pointIndex) * Math.PI / 180);
        const y = (distance) * Math.sin(((360+noise(8))/totalPoints*pointIndex) * Math.PI / 180);
        return [x, y];
    }
    
    function makeParticles($el) {
        const d = [90,10];
        const r = 100;
    
        const bubbleTime = animationTime * 2 + timeVariance;
        $el.style.setProperty('--time', bubbleTime + 'ms');
    
        for(let i = 0; i < pCount; i++) {
            const t = animationTime * 2 + noise(timeVariance * 2);
            const p = createParticle(i, t, d, r);
            const $place = $el;
            
            if ($place) {
                $place.classList.remove('active');
                setTimeout(() => {
                    const $particle = document.createElement('span');
                    const $point = document.createElement('span');
                    $particle.classList.add('particle');
                    $particle.style = `
                        --start-x: ${p.start[0]}px;
                        --start-y: ${p.start[1]}px;
                        --end-x: ${p.end[0]}px;
                        --end-y: ${p.end[1]}px;
                        --time: ${p.time}ms;
                        --scale: ${p.scale};
                        --color: var(--color-${p.color}, white);
                        --rotate: ${p.rotate}deg;
                    `;
                    $point.classList.add('point');
                    $particle.append($point);
                    $place.append($particle);
                    
                    requestAnimationFrame(() => {
                        $place.classList.add('active');
                    });
                    
                    setTimeout(() => {
                        try {
                            $place.removeChild($particle);
                        } catch(e) {
                            // Ignore errors if element is already removed
                        }
                    }, t);
                }, 30);
            }
        }
    }
    
    function createParticle(i, t, d, r) {
        let rotate = noise(r/10);
        let minDistance = d[0];
        let maxDistance = d[1];
        return {
            start: getXY(minDistance, pCount-i, pCount),
            end: getXY(maxDistance+noise(7), pCount-i, pCount),
            time: t,
            scale: 1 + noise(0.2),
            color: colors[Math.floor(Math.random() * colors.length)],
            rotate: rotate > 0 ? (rotate + r/20)*10 : (rotate - r/20)*10
        }
    }
    
    // Make sure the updateEffectPosition function is updated to handle scrolling
    function updateEffectPosition(element) {
        const pos = element.getBoundingClientRect();
        const styles = {
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            width: `${pos.width}px`,
            height: `${pos.height}px`
        };
        
        Object.assign(effectEl.style, styles);
        Object.assign(textEl.style, styles);
        textEl.innerText = element.innerText;
    }
    
    if (nav) {
        nav.querySelectorAll('li').forEach(($el) => {
            const link = $el.querySelector('a');
        
            const handleClick = (e) => {
                updateEffectPosition($el);
            
                if (!$el.classList.contains('active')) {
                    nav.querySelectorAll('li').forEach(($otherEl) => {
                        $otherEl.classList.remove('active');
                    });
                    
                    effectEl.querySelectorAll('.particle').forEach(($particle) => {
                        effectEl.removeChild($particle);
                    });
                    
                    $el.classList.add('active');
                    textEl.classList.remove('active');
            
                    setTimeout(() => {
                        textEl.classList.add('active');
                    }, 100);
            
                    makeParticles(effectEl);
                }
            };
        
            $el.addEventListener('click', handleClick);
        
            // Add keyboard navigation
            if (link) {
                link.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault(); // Prevent default action for space key
                        handleClick(e);
                    }
                });
            }
        });
        
        // Resize Observer
        const resizeObserver = new ResizeObserver(() => {
            const activeEl = nav.querySelector('li.active');
            if (activeEl) {
                updateEffectPosition(activeEl);
            }
        });
        
        resizeObserver.observe(document.body);
        
        // Activate first item by default
        setTimeout(() => {
            const firstItem = nav.querySelector('li');
            if (firstItem) {
                firstItem.click();
            }
        }, 200);
    }
});