/* ==========================================
   Referral Hub - JavaScript
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================
       Smooth Navigation
    ========================================== */

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function(e){

            e.preventDefault();

            const target=document.querySelector(this.getAttribute("href"));

            if(target){

                target.scrollIntoView({
                    behavior:"smooth",
                    block:"start"
                });

            }

        });

    });

    /* ==========================================
       Search Company Cards
    ========================================== */

    const search=document.getElementById("search");

    if(search){

        search.addEventListener("keyup",function(){

            const value=this.value.toLowerCase();

            const cards=document.querySelectorAll(".company-card");

            cards.forEach(card=>{

                const text=card.innerText.toLowerCase();

                card.style.display=text.includes(value) ? "block" : "none";

            });

        });

    }

    /* ==========================================
       Animated Counters
    ========================================== */

    const counters=document.querySelectorAll(".counter");

    const speed=200;

    const animateCounter=()=>{

        counters.forEach(counter=>{

            const target=+counter.dataset.target;

            const count=+counter.innerText;

            const increment=target/speed;

            if(count<target){

                counter.innerText=Math.ceil(count+increment);

                setTimeout(animateCounter,15);

            }

            else{

                counter.innerText=target;

            }

        });

    };

    const stats=document.querySelector(".stats");

    if(stats){

        const observer=new IntersectionObserver(entries=>{

            entries.forEach(entry=>{

                if(entry.isIntersecting){

                    animateCounter();

                    observer.disconnect();

                }

            });

        });

        observer.observe(stats);

    }

    /* ==========================================
       Scroll Reveal
    ========================================== */

    const revealItems=document.querySelectorAll(

        ".hero,.stat-card,.company-card,.premium,#contact"

    );

    const reveal=()=>{

        const windowHeight=window.innerHeight;

        revealItems.forEach(item=>{

            const top=item.getBoundingClientRect().top;

            if(top<windowHeight-100){

                item.style.opacity="1";
                item.style.transform="translateY(0)";

            }

        });

    };

    revealItems.forEach(item=>{

        item.style.opacity="0";
        item.style.transform="translateY(50px)";
        item.style.transition="all .8s ease";

    });

    window.addEventListener("scroll",reveal);

    reveal();

    /* ==========================================
       Navbar Background
    ========================================== */

    const nav=document.querySelector("nav");

    window.addEventListener("scroll",()=>{

        if(window.scrollY>50){

            nav.style.background="rgba(13,17,23,.95)";
            nav.style.boxShadow="0 10px 30px rgba(0,0,0,.4)";

        }

        else{

            nav.style.background="rgba(13,17,23,.75)";
            nav.style.boxShadow="none";

        }

    });

    /* ==========================================
       Active Menu
    ========================================== */

    const sections=document.querySelectorAll("section");

    const navLinks=document.querySelectorAll(".menu a");

    window.addEventListener("scroll",()=>{

        let current="";

        sections.forEach(section=>{

            const top=section.offsetTop-150;

            const height=section.clientHeight;

            if(pageYOffset>=top){

                current=section.getAttribute("id");

            }

        });

        navLinks.forEach(link=>{

            link.classList.remove("active");

            if(link.getAttribute("href")==="#"+current){

                link.classList.add("active");

            }

        });

    });

    /* ==========================================
       Typing Effect
    ========================================== */

    const typing=document.querySelector(".typing");

    if(typing){

        const text=typing.dataset.text;

        typing.innerHTML="";

        let i=0;

        function type(){

            if(i<text.length){

                typing.innerHTML+=text.charAt(i);

                i++;

                setTimeout(type,70);

            }

        }

        type();

    }

    /* ==========================================
       Ripple Button Effect
    ========================================== */

    document.querySelectorAll(".btn,.premium-btn").forEach(button=>{

        button.addEventListener("click",function(e){

            const circle=document.createElement("span");

            const diameter=Math.max(

                this.clientWidth,

                this.clientHeight

            );

            circle.style.width=diameter+"px";
            circle.style.height=diameter+"px";

            circle.style.position="absolute";
            circle.style.borderRadius="50%";
            circle.style.background="rgba(255,255,255,.4)";
            circle.style.transform="scale(0)";
            circle.style.animation="ripple .6s linear";
            circle.style.pointerEvents="none";

            const rect=this.getBoundingClientRect();

            circle.style.left=e.clientX-rect.left-diameter/2+"px";
            circle.style.top=e.clientY-rect.top-diameter/2+"px";

            this.appendChild(circle);

            setTimeout(()=>{

                circle.remove();

            },600);

        });

        button.style.position="relative";
        button.style.overflow="hidden";

    });

    /* ==========================================
       Back To Top Button
    ========================================== */

    const topBtn=document.createElement("button");

    topBtn.innerHTML="↑";

    topBtn.style.position="fixed";
    topBtn.style.right="25px";
    topBtn.style.bottom="25px";
    topBtn.style.width="50px";
    topBtn.style.height="50px";
    topBtn.style.border="none";
    topBtn.style.borderRadius="50%";
    topBtn.style.background="#8b5cf6";
    topBtn.style.color="#fff";
    topBtn.style.fontSize="22px";
    topBtn.style.cursor="pointer";
    topBtn.style.display="none";
    topBtn.style.zIndex="999";
    topBtn.style.boxShadow="0 10px 25px rgba(0,0,0,.4)";

    document.body.appendChild(topBtn);

    window.addEventListener("scroll",()=>{

        if(window.scrollY>400){

            topBtn.style.display="block";

        }

        else{

            topBtn.style.display="none";

        }

    });

    topBtn.addEventListener("click",()=>{

        window.scrollTo({

            top:0,
            behavior:"smooth"

        });

    });

    /* ==========================================
       Page Fade In
    ========================================== */

    document.body.style.opacity="0";

    document.body.style.transition="opacity .8s";

    window.onload=()=>{

        document.body.style.opacity="1";

    };

});

/* ==========================================
   Ripple Animation
========================================== */

const style=document.createElement("style");

style.innerHTML=`

@keyframes ripple{

from{

transform:scale(0);
opacity:.7;

}

to{

transform:scale(4);
opacity:0;

}

}

.menu a.active{

color:#8b5cf6;
font-weight:600;

}

`;

document.head.appendChild(style);
