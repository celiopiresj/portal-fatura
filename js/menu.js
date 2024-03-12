var pageMenu = document.querySelector(".page-menu")
var buttonMenu = document.querySelector(".button-menu");
var header = document.querySelector("header")

buttonMenu.addEventListener("click", () => {
    pageMenu.classList.toggle("expand")
})

window.addEventListener('scroll', () => {
    let scrollPosition = window.scrollY;

    if (scrollPosition > 80) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});