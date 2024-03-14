moment.locale('pt-br')
const buttonTotalMenu = document.querySelector(".container-button-total-menu");
const popUpButtonTotalMenu = document.querySelector(".pop-up-button-total-menu")

buttonTotalMenu.addEventListener("click", () => {
    if (popUpButtonTotalMenu.classList.contains("active")) {
        popUpButtonTotalMenu.innerHTML = "-"
        popUpButtonTotalMenu.classList.remove("active")
    } else {
        popUpButtonTotalMenu.classList.add("active")
        popUpButtonTotalMenu.innerHTML = `
        <button type="button">Exportar XLS</button>
        <button type="button">Encaminhar via WhatsApp</button>`
    }; 
})

const creditCardSMenuMonths = document.querySelector(".credit-card-statements-menu")
const buttonsPrevious = creditCardSMenuMonths.querySelectorAll(".previous")
const buttonsNext = creditCardSMenuMonths.querySelectorAll(".next")
const currentMonth = creditCardSMenuMonths.querySelector(".current-month")
const currentInfo = creditCardSMenuMonths.querySelector(".current-info")

const systemCurrentDate = moment();
const months = {}
for (let index = 11; index > 0; index--) {
    let currentDate = systemCurrentDate.clone().subtract(index - 6, 'months')
    months[currentDate.format("MMM").toUpperCase()+ " "  + (currentDate.format("YY") == systemCurrentDate.format("YY") ? "" : currentDate.format("YY"))] = currentDate
}
const monthsKeys = Object.keys(months)
console.log(monthsKeys)
currentMonth.textContent =  monthsKeys[5]
let currentMonthIndex = monthsKeys.indexOf(currentMonth.textContent)
const buttonNextText = Array.from(buttonsNext).filter(btnNext => btnNext.classList.contains("menu-item"))[0];
const buttonPreviousText = Array.from(buttonsPrevious).filter(btnPrevious => btnPrevious.classList.contains("menu-item"))[0];

buttonsPrevious.forEach(button => {
    if (button.classList.contains("menu-item")) {
        button.textContent = monthsKeys[4]
    }
   
    button.addEventListener("click", () => {
        currentMonthIndex = (currentMonthIndex - 1) % monthsKeys.length;
        currentMonth.textContent = monthsKeys[currentMonthIndex];
        buttonPreviousText.textContent = monthsKeys[currentMonthIndex - 1] 
        buttonNextText.textContent = monthsKeys[currentMonthIndex + 1];
        if (currentMonthIndex == 5) {
            currentInfo.textContent = "Fatura atual"
        } else if (currentMonthIndex < 5) {
            currentInfo.textContent = "Fatura anterior"
        }
        else {
            currentInfo.textContent = "Próxima fatura"
        }
    });
})

buttonsNext.forEach(button => {
    if (button.classList.contains("menu-item")) {
        button.textContent = monthsKeys[6]
    }

    button.addEventListener("click", () => {
        currentMonthIndex = (currentMonthIndex + 1 + monthsKeys.length) % monthsKeys.length;
        currentMonth.textContent = monthsKeys[currentMonthIndex];
        buttonNextText.textContent = monthsKeys[currentMonthIndex + 1] 
        buttonPreviousText.textContent = monthsKeys[currentMonthIndex - 1];
        if (currentMonthIndex == 5) {
            currentInfo.textContent = "Fatura atual"
        } else if (currentMonthIndex < 5) {
            currentInfo.textContent = "Fatura anterior"
        }
        else {
            currentInfo.textContent = "Próxima fatura"
        }
    });
})




// document.addEventListener('DOMContentLoaded', function () {
//     const currentMonth = document.querySelector('.current-month');
//     const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
//     let currentMonthIndex = months.indexOf(currentMonth.textContent);

//     document.querySelector('.previous').addEventListener('click', function () {
//         currentMonthIndex = (currentMonthIndex - 1 + months.length) % months.length;
//         currentMonth.textContent = months[currentMonthIndex];
//     });

//     document.querySelector('.next').addEventListener('click', function () {
//         currentMonthIndex = (currentMonthIndex + 1) % months.length;
//         currentMonth.textContent = months[currentMonthIndex];
//     });
// });