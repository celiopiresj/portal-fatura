var header = document.querySelector(".header")

window.addEventListener('scroll', () => {
    let scrollPosition = window.scrollY;

    if (scrollPosition > 80) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

var sidebar = document.querySelector(".sidebar")
var sidebar__button = sidebar.querySelector(".sidebar__button")
var sidebar__button_register = sidebar.querySelector(".sidebar__button_register")
var sidebar__button_register

sidebar__button.addEventListener("click", () => {
    sidebar.classList.toggle("sidebar--open")
    sidebar__button_register.classList.toggle("md-fba-extended")
})