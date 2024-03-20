moment.locale('pt-br')

let dataItems;
let dataCategories;
let dataCards;
let dataItemnsCurrent = [];

async function fetchData() {
    try {
        const responseData = await fetch('../data/db.json');
        const responseCategories = await fetch("./data/categories.json");
        const responseCards = await fetch("./data/cards.json");
        
        dataItems = await responseData.json();
        dataCategories = await responseCategories.json();
        dataCards = await responseCards.json();
        
        console.log("Dados carregados com sucesso.");
    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }   
}

// const popUp = document.querySelector(".pop-up")

// function pagePopUp(textPage) {
//     const page = document.createElement("div");
//     const pageMenu = document.createElement("div");
//     const textMenu = document.createElement("div");
//     const actionMenu = document.createElement("div");
//     const iconX = document.createElement("span")
    
//     iconX.textContent = "close"
//     iconX.classList.add("material-symbols-outlined")
//     page.classList.add("pop-up-page");
//     pageMenu.classList.add("pop-up-page-menu");
//     textMenu.classList.add("text");
//     actionMenu.classList.add("action");
//     actionMenu.classList.add("button");
//     textMenu.textContent = textPage
//     actionMenu.appendChild(iconX)
//     pageMenu.appendChild(textMenu);
//     pageMenu.appendChild(actionMenu);
//     page.appendChild(pageMenu);

//     return page;
// }

// popUp.addEventListener("click", function(e){
//     if (e.target === this || e.target.parentNode.classList.contains("action") ) {
//         this.innerHTML = ""
//         this.classList.remove("active")
//     }
// })

// async function addData() {
//     try {
//         const data = dataItems;
//         const categoriesData = dataCategories;
//         const cardsData =  dataCards;
        
//         const clasColor = Object.values(categoriesData).map(category => {
//             return `.icon-color-${category.icon} { 
//                 background-color: ${category.color}; 
//             }`; 
//         });

//         // const filteredData = data.filter(item => {
//         //     const allowedCustomers = ["José Silva", "Gustavo Martins", "Aline", "Alexandre", "Marilene"];
//         //     return allowedCustomers.includes(item.customer);
//         // });

//         const styleTag = document.createElement('style');
//         styleTag.textContent = clasColor.join(" ")
//         document.head.appendChild(styleTag);

//         const table = document.querySelector(".credit-card-statement-table tbody")
//         table.innerHTML = ""
//         const currentDate = months[monthsKeys[currentMonthIndex]]
//         const cardsValues = {}

//         dataItemnsCurrent = []

//         data.forEach(rowData => {
//             if(moment(currentDate).format("MM") === moment(rowData.date).format("MM")){
//                 if (cardsData.hasOwnProperty(rowData.card)) {
//                     dataItemnsCurrent.push(rowData)
//                     cardsValues[rowData.card] = rowData.amount + (cardsValues[rowData.card] ? cardsValues[rowData.card] : 0);
//                     const rowTable = document.createElement("tr")
//                     rowTable.classList.add("credit-card-statement-row")
//                     const amount = (rowData.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
//                     rowTable.innerHTML = `
//                         <td class="statement-date">
//                             <span>${moment(rowData.date).format('DD MMM').toUpperCase()}</span>
//                         </td>
//                         <td class="statement-category">
//                             <div class="container-category">
//                                 <div class="container-icon icon-color-${categoriesData[rowData["category"]]["icon"]}"><span class="material-symbols-outlined">${categoriesData[rowData["category"]]["icon"]}</span></div>
//                                 <span>${rowData.category}</span>
//                             </div>
//                         </td>
//                         <td class="statement-description">
//                             <span>${rowData.description}</span>
//                         </td>
//                         <td class="statement-credit-card">
//                             <span>${rowData.card}</span>
//                         </td>
//                         <td class="statement-customer">
//                             <span>${rowData.customer}</span>
//                         </td>
//                         <td class="statement-value">
//                             <span>${amount}</span>
//                         </td>
//                     `

//                     rowTable.addEventListener("click", ()=> {
//                         console.log(rowData)
//                     })
//                     table.appendChild(rowTable)
//                 }
//             }
//         })

//         const creditCardStatement = document.querySelector(".credit-card-statements")
//         creditCardStatement.innerHTML = ""
//         Object.entries(cardsData).forEach(cardInfo => {
//              const due_date = moment(`${cardInfo[1].due_date}/${moment(currentDate).format("MM/YYYY")}`, "DD/MM/YYYY").format("DD MMM"); 
//             let closing_date = ''
//             const today = moment();
            
//             if(cardInfo[1].closing_date < cardInfo[1].due_date) {
//                 closing_date = moment(`${cardInfo[1].closing_date}/${moment(currentDate).format("MM/YYYY")}`, "DD/MM/YYYY");
//             } else{
//                 closing_date = moment(`${cardInfo[1].closing_date}/${moment(currentDate).subtract(1, 'months').format("MM/YYYY")}`, "DD/MM/YYYY");
//             }
          
//             const card = `
//             <div class="credit-card-statement">
//                 <span class="statement-name">
//                     <span>${cardInfo[0]}</span>
//                 </span>
//                 <span class="statement-value">${(cardsValues[cardInfo[0]]).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
//                 <span class="statement-status">${ today.isSameOrAfter(closing_date)? "Fechada" : `Fechamento em <strong>${closing_date.format("DD MMM").toUpperCase()}</strong>`}</span>
//                 <span class="statement-due-date">Vencimento em <strong>${due_date.toUpperCase()}</strong></span>
//                 <span class="statement-customer"></span>
//             </div>`

//             creditCardStatement.innerHTML +=card;
//         })

//     } catch (error) {
//         console.error('Erro ao carregar os dados:', error);
//     }
// }

// const creditCardSMenuMonths = document.querySelector(".credit-card-statements-menu");
// const buttonsPrevious = creditCardSMenuMonths.querySelectorAll(".previous");
// const buttonsNext = creditCardSMenuMonths.querySelectorAll(".next");
// const currentMonth = creditCardSMenuMonths.querySelector(".current-month");
// const currentInfo = creditCardSMenuMonths.querySelector(".current-info");


// const buttonNextText = Array.from(buttonsNext).filter(btnNext => btnNext.classList.contains("menu-item"))[0];
// const buttonPreviousText = Array.from(buttonsPrevious).filter(btnPrevious => btnPrevious.classList.contains("menu-item"))[0];

// buttonsPrevious.forEach(button => {
//     if (button.classList.contains("menu-item")) {
//         button.textContent = monthsKeys[4];
//     }
   
//     button.addEventListener("click", () => {
//         currentMonthIndex = (currentMonthIndex - 1) % monthsKeys.length;
//         currentMonth.textContent = monthsKeys[currentMonthIndex];
//         buttonPreviousText.textContent = monthsKeys[currentMonthIndex - 1] ;
//         buttonNextText.textContent = monthsKeys[currentMonthIndex + 1];
//         if (currentMonthIndex == 5) {
//             currentInfo.textContent = "Fatura atual";
//         } else if (currentMonthIndex < 5) {
//             currentInfo.textContent = "Fatura anterior";
//         }
//         else {
//             currentInfo.textContent = "Próxima fatura";
//         }
//         addData()
//     });
// });

// buttonsNext.forEach(button => {
//     if (button.classList.contains("menu-item")) {
//         button.textContent = monthsKeys[6];
//     }

//     button.addEventListener("click", () => {
//         currentMonthIndex = (currentMonthIndex + 1 + monthsKeys.length) % monthsKeys.length;
//         currentMonth.textContent = monthsKeys[currentMonthIndex];
//         buttonNextText.textContent = monthsKeys[currentMonthIndex + 1];
//         buttonPreviousText.textContent = monthsKeys[currentMonthIndex - 1];
//         if (currentMonthIndex == 5) {
//             currentInfo.textContent = "Fatura atual";
//         } else if (currentMonthIndex < 5) {
//             currentInfo.textContent = "Fatura anterior";
//         }
//         else {
//             currentInfo.textContent = "Próxima fatura";
//         }
//         addData()
//     });
// });


// const body = document.querySelector('body');
// const styleBody = window.getComputedStyle(body);
// const fontSize = styleBody.fontSize.match(/\d+(\.\d+)?/)[0];

// const creditCardFilters = document.querySelector(".credit-card-statements-filters");
// const buttonExport = creditCardFilters.querySelector(".container-export .export");
// const popUpExport = creditCardFilters.querySelector(".pop-up-export");

// buttonExport.addEventListener("click", () => {

//     const widthcontainerEport = (creditCardFilters.querySelector(".container-export").offsetWidth / fontSize ) / 2;

//     if (popUpExport.classList.contains("active")) {
//         popUpExport.innerHTML = "-";
//         popUpExport.classList.remove("active");
//     } else {
//         popUpExport.classList.add("active");
//         popUpExport.innerHTML = `
//         <button type="button">Exportar XLS</button>
//         <button type="button">Encaminhar via WhatsApp</button>`
//         const widthPopUp = (popUpExport.offsetWidth) / fontSize ;
//         popUpExport.style.transform = `translate(-${widthPopUp + widthcontainerEport}rem, 2rem)`;
//     }; 
// })

// const buttonFilter = creditCardFilters.querySelector(".button-filter");

// buttonFilter.addEventListener("click", () => {
//     popUp.classList.add("active")
//     const page = pagePopUp("Filtros")
//     const pageFilters = document.createElement("div")
//     pageFilters.classList.add("credit-card-statements-filters-page")

//     const pageDates = document.createElement("div")
//     const pageCategories = document.createElement("div")
//     const pageDescriptions = document.createElement("div")
//     const pageCards = document.createElement("div")
//     const pagecustomers = document.createElement("div")
//     const pageValues = document.createElement("div")
    
//     pageDates.innerHTML = '<div class="container-title"><span>Data</span></div>'
//     pageCategories.innerHTML = '<div class="container-title"><span>Categoria</span></div>'
//     pageDescriptions.innerHTML = '<div class="container-title"><span>Descrição</span></div>'
//     pageCards.innerHTML = '<div class="container-title"><span>Cartão</span></div>'
//     pagecustomers.innerHTML = '<div class="container-title"><span>Clientes</span></div>'
//     pageValues.innerHTML = '<div class="container-title"><span>Valores</span></div>'
    
//     const uniqueDates = new Set();
//     const uniqueCategories = new Set();
//     const uniqueDescriptions = new Set();
//     const uniqueCards = new Set();
//     const uniqueCustomers = new Set();
//     const uniqueValues = new Set();
    
//     for (const rowData of dataItemnsCurrent) {
//         uniqueDates.add(rowData.date);
//         uniqueCategories.add(rowData.category);
//         uniqueDescriptions.add(rowData.description);
//         uniqueCards.add(rowData.card);
//         uniqueCustomers.add(rowData.customer);
//         uniqueValues.add(rowData.amount);
//     }
    
//     const contentDates = Array.from(uniqueDates, date => `<span class="select-none date" data-value=${date}>${moment(date).format("DD/MM/YYYY")}</span>`).join('');
//     const contentCategories = Array.from(uniqueCategories, category => `<span class="select-none category" data-value="${category}">${category}</span>`).join('');
//     const contentDescriptions = Array.from(uniqueDescriptions, description => `<span class="select-none description" data-value="${description}">${description}</span>`).join('');
//     const contentCards = Array.from(uniqueCards, card => `<span class="select-none card" data-value="${card}">${card}</span>`).join('');
//     const contentCustomers = Array.from(uniqueCustomers, customer => `<span class="select-none custumer" data-value="${customer}">${customer}</span>`).join('');
//     const contentValues = Array.from(uniqueValues, value => `<span class="select-none value" data-value="${value}">${(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>`).join('');

//     pageDates.innerHTML += `<div class="container-items-filters">${contentDates}</div>`;
//     pageFilters.appendChild(pageDates);
    
//     pageCategories.innerHTML += `<div class="container-items-filters">${contentCategories}</div>`;
//     pageFilters.appendChild(pageCategories);
    
//     pageDescriptions.innerHTML += `<div class="container-items-filters">${contentDescriptions}</div>`;
//     pageFilters.appendChild(pageDescriptions);
    
//     pageCards.innerHTML += `<div class="container-items-filters">${contentCards}</div>`;
//     pageFilters.appendChild(pageCards);
    
//     pagecustomers.innerHTML += `<div class="container-items-filters">${contentCustomers}</div>`;
//     pageFilters.appendChild(pagecustomers);
    
//     pageValues.innerHTML += `<div class="container-items-filters">${contentValues}</div>`;
//     pageFilters.appendChild(pageValues);

//     const buttonFilters = pageFilters.querySelectorAll('span[data-value]')

//     buttonFilters.forEach(buttonFilter => {
//         buttonFilter.addEventListener("click", function(e) {
//             const filter = e.target.getAttribute('data-value')
            
//             if (e.target.classList.contains("active")) {
//                 e.target.classList.remove("active")
//             }
//             else {
//                 e.target.classList.add("active")
//             }
//         }) 
       
//     })

//     let div = document.createElement("div")
//     div.classList.add("container-button-filter")
//     div.innerHTML =`<button type="button" class="apply select-none">Aplicar</button>
//     <button type="button" class="cancel select-none">Cancelar</button>`

//     page.appendChild(pageFilters)
//     page.appendChild(div)
//     popUp.appendChild(page)
// })

// function filteredData(vaueFilter,column){
//     const items = document.querySelector(".credit-card-statement-table tbody")
//     const buttonFilters = pageFilters.querySelectorAll('span[data-value]')

//     console.log(items)
//     // items.forEach(item => {
//     //     console.log(console.log(item))
//     // })
// }

const months_buttons = document.querySelector(".credit-card-statements__months-buttons")
const previous_month_button = months_buttons.querySelector(".button--previous")
const next_month_button = months_buttons.querySelector(".button--next")
const current_month_label = months_buttons.querySelector(".current-month")
const current_table = document.querySelector(".credit-card-statements__content")

const systemCurrentDate = moment();
const months = {};
for (let index = 11; index > 0; index--) {
    let currentDate = systemCurrentDate.clone().subtract(index - 6, 'months');
    months[currentDate.format("MMM").toUpperCase() + " "  + (currentDate.format("YY") == systemCurrentDate.format("YY") ? "" : currentDate.format("YY"))] = currentDate;
}

const monthsKeys = Object.keys(months);
current_month_label.querySelector(".current-month__text").textContent =  monthsKeys[5];
previous_month_button.querySelector(".button__text").textContent =  monthsKeys[4];
next_month_button.querySelector(".button__text").textContent =  monthsKeys[6];
let currentMonthIndex = monthsKeys.indexOf(monthsKeys[5]);

previous_month_button.addEventListener("click", function() {
    const text = this.querySelector(".button__text");
    currentMonthIndex= (currentMonthIndex - 1 + monthsKeys.length) % monthsKeys.length;
    current_month_label.querySelector(".current-month__text").textContent =  monthsKeys[currentMonthIndex];
    text.textContent = monthsKeys[currentMonthIndex - 1];
    next_month_button.querySelector(".button__text").textContent =  monthsKeys[currentMonthIndex + 1];
    addData();
})

next_month_button.addEventListener("click", function() {
    const text = this.querySelector(".button__text");
    currentMonthIndex= (currentMonthIndex + 1 + monthsKeys.length) % monthsKeys.length;
    current_month_label.querySelector(".current-month__text").textContent =  monthsKeys[currentMonthIndex];
    previous_month_button.querySelector(".button__text").textContent =  monthsKeys[currentMonthIndex - 1];
    text.textContent = monthsKeys[currentMonthIndex + 1];
    addData();
})


async function addData(){
    try {
        const data = dataItems;
        const categoriesData = dataCategories;
        const cardsData =  dataCards;
        const current_month = months[monthsKeys[currentMonthIndex]]
        const dataItemnsCurrent = data.filter(rowCurrent => moment(rowCurrent.date).format("MM-YY") === moment(current_month).format("MM-YY"));
        
        const clasColor = Object.values(categoriesData).map(category => {
                        return `.icon-color-${category.icon} { 
                            background-color: ${category.color}; 
                        }`; 
                    });
            
        const styleTag = document.createElement('style');
        styleTag.textContent = clasColor.join(" ")
        document.head.appendChild(styleTag);
        
        const cardsValues = {}
        current_table.querySelector("tbody").innerHTML = ""
        
        dataItemnsCurrent.forEach(rowCurrent => {
            cardsValues[rowCurrent.card] = rowCurrent.amount + (cardsValues[rowCurrent.card] ? cardsValues[rowCurrent.card] : 0);
            const rowTable = document.createElement("tr")
            rowTable.classList.add("credit-card-statement-row")
            const amount = (rowCurrent.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            rowTable.innerHTML = `
                <td class="statement-date">
                    <span>${moment(rowCurrent.date).format('DD MMM').toUpperCase()}</span>
                </td>
                <td class="statement-category">
                    <div class="container-category">
                        <div class="container-icon icon-color-${categoriesData[rowCurrent["category"]]["icon"]}"><span class="material-symbols-outlined">${categoriesData[rowCurrent["category"]]["icon"]}</span></div>
                        <span>${rowCurrent.category}</span>
                    </div>
                </td>
                <td class="statement-description">
                    <span>${rowCurrent.description}</span>
                </td>
                <td class="statement-credit-card">
                    <span>${rowCurrent.card}</span>
                </td>
                <td class="statement-customer">
                    <span>${rowCurrent.customer}</span>
                </td>
                <td class="statement-value">
                    <span>${amount}</span>
                </td>
                                `
            
            rowTable.addEventListener("click", ()=> {
                console.log(rowData)
            })
            
            current_table.querySelector("tbody").appendChild(rowTable)
        });

    } catch (error) {
        console.error(error)
    }   
}

fetchData().then(() => {

    // filteredData()
    addData()  
});

