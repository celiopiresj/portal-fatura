moment.locale('pt-br')

let dataItems = [];
let dataCategories = [];
let dataCards = [];
let dataItemnsCurrent = [];
let dataBills = []

const pop_up = document.querySelector(".pop-up")

function windowPopUp(textWindow) {
    const window = document.createElement("div");
    const title_bar = document.createElement("div");
    const title_bar_text = document.createElement("div");
    const action_title_bar = document.createElement("div");
    const iconX = document.createElement("span")
    
    iconX.textContent = "close"
    iconX.classList.add("material-symbols-outlined")
    iconX.classList.add("icon")
    window.classList.add("pop-up__window");
    title_bar.classList.add("pop-up__title-bar");
    title_bar_text.classList.add("pop-up__title-bar__text");
    action_title_bar.classList.add("pop-up__title-bar__button");
    action_title_bar.classList.add("button");
    action_title_bar.classList.add("close-window");
    title_bar_text.textContent = textWindow
    action_title_bar.appendChild(iconX)
    title_bar.appendChild(title_bar_text);
    title_bar.appendChild(action_title_bar);
    window.appendChild(title_bar);

    return window;
}

pop_up.addEventListener("click", function(e){
    if (e.target === this || e.target.parentNode.classList.contains("close-window") ) {
        this.innerHTML = ""
        this.classList.remove("active")
    }
})

const months_buttons = document.querySelector(".credit-card-bills__months-buttons")
const previous_month_button = months_buttons.querySelector(".button--previous")
const next_month_button = months_buttons.querySelector(".button--next")
const current_month_label = months_buttons.querySelector(".current-month")
const current_table = document.querySelector(".credit-card-bills__content")
const monthsKeys = []
let currentMonthIndex;

// Criação de um objeto para armazenar o mapeamento de meses
const systemCurrentDate = moment();
const months = {};

async function fetchData() {
    try {

        // Buscar dados das faturas
        const bills = await fetch('http://localhost:3000/api/bills')
        dataBills = await bills.json();

        // Buscar dados das transações de cartões
        const cardsTransactionsResponse = await fetch('http://localhost:3000/api/bills/items');
        dataItems = await cardsTransactionsResponse.json();

        // Buscar dados das categorias
        const categoriesResponse = await fetch('http://localhost:3000/api/categories');
        dataCategories = await categoriesResponse.json();

        // Buscar dados dos cartões
        const cardsResponse = await fetch('http://localhost:3000/api/cards');
        dataCards = await cardsResponse.json();

        let firtsDate;
        let lastDate;

        dataBills.forEach(bill => {
            if (!firtsDate || moment(bill.due_date).isBefore(firtsDate)) {
                firtsDate = moment(bill.due_date);
            }
            if (!lastDate || moment(bill.due_date).isAfter(lastDate)) {
                lastDate = moment(bill.due_date);
            }
        });

          // Preenchendo o objeto 'months' com os meses dos últimos 6 meses, incluindo o atual
        for (let index = 11; index > 0; index--) {
            let currentDate = systemCurrentDate.clone().subtract(index - 6, 'months');
            months[currentDate.format("MMM").toUpperCase() + " "  + (currentDate.format("YY") == systemCurrentDate.format("YY") ? "" : currentDate.format("YY"))] = currentDate;
        }

        // Obtendo as chaves do objeto 'months'
        Object.keys(months).forEach(month => monthsKeys.push(month));

        // Definindo o rótulo do mês atual e o índice do mês atual
        current_month_label.querySelector(".current-month-text").textContent =  monthsKeys[5];
        currentMonthIndex = monthsKeys.indexOf(monthsKeys[5]);

    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }   
}

async function addData() {
        // Obtendo os dados necessários
        const data = dataItems;
        const categoriesData = dataCategories;

        const cardsData = dataCards;
        const current_month = months[monthsKeys[currentMonthIndex]];

        // Gerando as cores das categorias dinamicamente
        const classColor = categoriesData.map(category => {
            return `.icon-color-${category.icon} { 
                background-color: ${category.color}; 
            }`; 
        });

        // Criando uma tag de estilo dinâmica e adicionando ao cabeçalho do documento
        const styleTag = document.createElement('style');
        styleTag.textContent = classColor.join(" ");
        document.head.appendChild(styleTag);

        // Inicializando um objeto para armazenar os valores dos cartões
        const cardsValues = {};

        // Limpando o conteúdo da tabela atual
        current_table.querySelector("tbody").innerHTML = "";

        // Inicializando um array para armazenar os dados do mês atual
        dataItemnsCurrent = [];

        // Iterando sobre os dados para preencher a tabela do mês atual
        data.forEach(rowCurrent => {

            if (moment(rowCurrent.due_date).format("MM-YY") === moment(current_month).format("MM-YY")) {
                dataItemnsCurrent.push(rowCurrent);

                // Calculando os valores dos cartões

                const valueTotal = cardsValues[rowCurrent.card_id] ? parseInt(cardsValues[rowCurrent.card_id]) : 0

                cardsValues[rowCurrent.card_id] = Dinero({ 
                    amount: parseInt(rowCurrent.amount),
                    currency: 'BRL',
                    precision: 2
                }).add(Dinero({ 
                    amount: parseInt(valueTotal), 
                    currency: 'BRL',
                    precision: 2
                })).getAmount();

                const rowTable = document.createElement("tr");
                rowTable.classList.add("credit-card-bills__content__row");
 
                const amount = Dinero({ amount: rowCurrent.amount, currency: 'BRL',precision: 2 }).toFormat()
                
                // Gera o HTML para representar as compras
                rowTable.innerHTML = `
                    <td class="credit-card-bill__date">
                        <span>${moment(rowCurrent.installment_date).format('DD MMM').toUpperCase()}</span>
                    </td>
                    <td class="credit-card-bill__category">
                        <div class="credit-card-bill__category-container">
                            <div class="container-icon icon-color-${categoriesData.find(category => rowCurrent.category_id=== category.id)["icon"]}">
                                <span class="material-symbols-outlined icon">${categoriesData.find(category => rowCurrent.category_id=== category.id)["icon"]}</span>
                            </div>
                            <span class="category-text">${rowCurrent.category}</span>
                        </div>
                    </td>
                    <td class="credit-card-bill__description">
                        <span>${rowCurrent.description}</span>
                    </td>
                    <td class="credit-card-bill__credit-card">
                        <span>${rowCurrent.card_name.replace(/\b\w/g, char => char.toUpperCase())}</span>
                    </td>
                    <td class="credit-card-bill__customer">
                        <span>${rowCurrent.customer.replace(/\b\w/g, char => char.toUpperCase())}</span>
                    </td>
                    <td class="credit-card-bill__value">
                        <span>${amount}</span>
                    </td>
                `;

                rowTable.addEventListener("click", () => {
                    console.log(rowData);
                });

                current_table.querySelector("tbody").appendChild(rowTable);
            }
        });

        // Seleciona o elemento HTML que conterá os cartões de crédito e limpa seu conteúdo
        const credit_card_bills_cards = document.querySelector(".credit-card-bills__cards");
        credit_card_bills_cards.innerHTML = "";

        // Itera sobre os dados dos cartões para criar e adicionar cartões de crédito dinamicamente
            cardsData.forEach(cardInfo => {

                const current_bill = months[monthsKeys[currentMonthIndex]]

                32
            
                // Calcula a data de vencimento do cartão
                const due_day = moment(`${cardInfo.due_day}/${moment(current_bill).format("MM/YYYY")}`, "DD/MM/YYYY").format("DD MMM");
                let close_day = '';
                const today = moment();

                // Determina a data de fechamento do cartão
                if (cardInfo.close_day < cardInfo.due_day) {
                    close_day = moment(`${cardInfo.close_day}/${moment(current_bill).format("MM/YYYY")}`, "DD/MM/YYYY");
                } else {
                    close_day = moment(`${cardInfo.close_day}/${moment(current_bill).subtract(1, 'months').format("MM/YYYY")}`, "DD/MM/YYYY");
                }

                const card = `
                    <div class="credit-card-bills__card">
                        <span class="credit-card-bills__card-text">
                            <span>${cardInfo.name.replace(/\b\w/g, char => char.toUpperCase())}</span>
                        </span>
                        
                        <span class="credit-card-bills__card-value"><strong>${(cardsValues[cardInfo.id] ? Dinero({ amount: cardsValues[cardInfo.id], currency: 'BRL',precision: 2 }) : Dinero({ amount:0, currency: 'BRL',precision: 2 })).toFormat()}</strong></span>
                        <span class="credit-card-bills__card-status">${today.isSameOrAfter(close_day) ? "Fechada" : `Fechamento em <strong>${close_day.format("DD MMM").toUpperCase()}</strong>`}</span>
                        <span class="credit-card-bills__card-due-date">Vencimento em <strong>${due_day.toUpperCase()}</strong></span>
                        <span class="credit-card-bills__card-customer"></span>
                    </div>`;

                credit_card_bills_cards.innerHTML += card;
        });
}

fetchData().then(() => {
    // filteredData()
    addData()
    
    // Definindo o texto dos botões de mês anterior e próximo
    previous_month_button.querySelector(".button-text").textContent =  monthsKeys[4];
    next_month_button.querySelector(".button-text").textContent =  monthsKeys[6];

    previous_month_button.addEventListener("click", function() {
        const text = this.querySelector(".button-text");
        // Atualizando o índice do mês atual
        currentMonthIndex= (currentMonthIndex - 1 + monthsKeys.length) % monthsKeys.length;
        // Atualizando os rótulos dos meses e chamando a função para adicionar dados
        current_month_label.querySelector(".current-month-text").textContent =  monthsKeys[currentMonthIndex];
        text.textContent = monthsKeys[currentMonthIndex - 1];
        next_month_button.querySelector(".button-text").textContent =  monthsKeys[currentMonthIndex + 1];
        if (currentMonthIndex == 5) {
            current_month_label.querySelector(".current-month-status").textContent = "Fatura atual";
        } else if (currentMonthIndex < 5) {
            current_month_label.querySelector(".current-month-status").textContent = "Fatura anterior";
        }
        else {
            current_month_label.querySelector(".current-month-status").textContent = "Próxima fatura";
        }
        addData(); // Chamada para atualizar os dados da tabela
    })

    // Adicionando um ouvinte de evento ao botão de próximo mês
    next_month_button.addEventListener("click", function() {
        const text = this.querySelector(".button-text");
        // Atualizando o índice do mês atual
        currentMonthIndex= (currentMonthIndex + 1 + monthsKeys.length) % monthsKeys.length;
        // Atualizando os rótulos dos meses e chamando a função para adicionar dados
        current_month_label.querySelector(".current-month-text").textContent =  monthsKeys[currentMonthIndex];
        previous_month_button.querySelector(".button-text").textContent =  monthsKeys[currentMonthIndex - 1];
        text.textContent = monthsKeys[currentMonthIndex + 1];

        if (currentMonthIndex == 5) {
            current_month_label.querySelector(".current-month-status").textContent = "Fatura atual";
        } else if (currentMonthIndex < 5) {
            current_month_label.querySelector(".current-month-status").textContent = "Fatura anterior";
        }
        else {
            current_month_label.querySelector(".current-month-status").textContent = "Próxima fatura";
        }
        addData();
    })
});

const export_content = document.querySelector(".credit-card-bills__export-content");
const buttonExport = export_content.querySelector(".export-content__button");
const popUpExport = export_content.querySelector(".export-content__pop-up");

buttonExport.addEventListener("click", () => {

    if (popUpExport.classList.contains("active")) {
        popUpExport.innerHTML = "";
        popUpExport.classList.remove("active");
    } else {
        popUpExport.classList.add("active");
        popUpExport.innerHTML = `
        <button type="button">Exportar XLS</button>
        <button type="button">Encaminhar via WhatsApp</button>`
    }; 
})

const card_bills_filters = document.querySelector(".credit-card-bills__filters");
const button_filter = card_bills_filters.querySelector(".button-filter");
const filters_content = card_bills_filters.querySelector(".filters__content");

button_filter.addEventListener("click", () => {
    pop_up.classList.add("active")
    const window = windowPopUp("Filtros")
    const filter_window = document.createElement("div")
    filter_window.classList.add("credit-card-bills__filter-window")

    const filter_dates = document.createElement("div");
    filter_dates.classList.add("filter-window_section");

    const filter_categories = document.createElement("div");
    filter_categories.classList.add("filter-window_section");

    const filter_descriptions = document.createElement("div");
    filter_descriptions.classList.add("filter-window_section");

    const filter_cards = document.createElement("div");
    filter_cards.classList.add("filter-window_section");

    const filter_customers = document.createElement("div");
    filter_customers.classList.add("filter-window_section");

    const filter_values = document.createElement("div");
    filter_values.classList.add("filter-window_section");
    
    filter_dates.innerHTML = '<div class="section__title"><span class="section__title-text">Data</span></div>'
    filter_categories.innerHTML = '<div class="section__title"><span class="section__title-text">Categoria</span></div>'
    filter_descriptions.innerHTML = '<div class="section__title"><span class="section__title-text">Descrição</span></div>'
    filter_cards.innerHTML = '<div class="section__title"><span class="section__title-text">Cartão</span></div>'
    filter_customers.innerHTML = '<div class="section__title"><span class="section__title-text">Clientes</span></div>'
    filter_values.innerHTML = '<div class="section__title"><span class="section__title-text">Valores</span></div>'
    
    const uniqueDates = new Set();
    const uniqueCategories = new Set();
    const uniqueDescriptions = new Set();
    const uniqueCards = new Set();
    const uniqueCustomers = new Set();
    const uniqueValues = new Set();
    
    for (const rowData of dataItemnsCurrent) {
        uniqueDates.add(rowData.date);
        uniqueCategories.add(rowData.category);
        uniqueDescriptions.add(rowData.description);
        uniqueCards.add(rowData.card_name);
        uniqueCustomers.add(rowData.customer);
        uniqueValues.add(rowData.amount);
    }
    
    const content_dates = Array.from(uniqueDates, date => `<button type="button" class="button filter-button" data-value=${date}>${moment(date).format("DD/MM/YYYY")}</button>`).join('');
    const content_categories = Array.from(uniqueCategories, category => `<button type="button" class="button filter-button" data-value="${category}">${category}</button>`).join('');
    const content_descriptions = Array.from(uniqueDescriptions, description => `<button type="button" class="button filter-button" data-value="${description}">${description}</button>`).join('');
    const content_cards = Array.from(uniqueCards, card => `<button type="button" class="button filter-button" data-value="${card}">${card}</button>`).join('');
    const content_customers = Array.from(uniqueCustomers, customer => `<button type="button" class="button filter-button" data-value="${customer}">${customer}</button>`).join('');
    const content_values = Array.from(uniqueValues, value => `<button type="button" class="button filter-button" data-value="${value}">${(value/100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</button>`).join('');

    filter_dates.innerHTML += `<div class="section__button">${content_dates}</div>`;
    filter_window.appendChild(filter_dates);
    
    filter_categories.innerHTML += `<div class="section__button">${content_categories}</div>`;
    filter_window.appendChild(filter_categories);
    
    filter_descriptions.innerHTML += `<div class="section__button">${content_descriptions}</div>`;
    filter_window.appendChild(filter_descriptions);
    
    filter_cards.innerHTML += `<div class="section__button">${content_cards.replace(/\b\w/g, char => char.toUpperCase())}</div>`;
    filter_window.appendChild(filter_cards);
    
    filter_customers.innerHTML += `<div class="section__button">${content_customers.replace(/\b\w/g, char => char.toUpperCase())}</div>`;
    filter_window.appendChild(filter_customers);
    
    filter_values.innerHTML += `<div class="section__button">${content_values}</div>`;
    filter_window.appendChild(filter_values);

    const buttonFilters = filter_window.querySelectorAll('button[data-value]')

    buttonFilters.forEach(buttonFilter => {
        buttonFilter.addEventListener("click", function(e) {
            const filter = e.target.getAttribute('data-value')
            
            if (e.target.classList.contains("active")) {
                e.target.classList.remove("active")
            }
            else {
                e.target.classList.add("active")
            }
        }) 
       
    })

    let action_buttons = document.createElement("div")
    action_buttons.classList.add("filter_window__action-buttons")
    action_buttons.innerHTML =`<button type="button" class="button save">Salvar</button>
    <button type="button" class="button cancel">Limpar filtros</button>`

    window.appendChild(filter_window)
    window.appendChild(action_buttons)
    pop_up.appendChild(window)
})

function filteredData(vaueFilter,column){
    const items = document.querySelector(".credit-card-bill-table tbody")
    const buttonFilters = filter_window.querySelectorAll('span[data-value]')

    console.log(items)
    // items.forEach(item => {
    //     console.log(console.log(item))
    // })
}

const button_register = document.querySelector(".sidebar__button-register")

button_register.addEventListener("click", function(e) {
    const container_button_register = document.querySelector(".sidebar__container-button-register");
    let pop_up_register = document.querySelector(".pop-up-register");
    const sidebar = document.querySelector(".sidebar");

    // Função para remover o pop-up
    function removePopUp() {
        pop_up_register.remove();
        pop_up.classList.remove("pop-up__pop-up-register");
        pop_up.removeEventListener('click', removePopUp);
        sidebar.removeEventListener('click', popRegisterSidebarDel);
        button_register.classList.remove("active");
    }

    // Função para adicionar o pop-up
    function addPopUp() {
        button_register.classList.add("active");
        pop_up.classList.add("pop-up__pop-up-register");
        pop_up_register = document.createElement("div");
        pop_up_register.innerHTML = `
            <div class="pop-up-register__buttons pay-bill">
                <button type="button" class="button md-fba-small">
                    <span class="material-symbols-outlined md-fba-icon">
                        payments
                    </span>
                </button>
                <button type="button" class="button button-text">Pagar fatura</button>
            </div>
            <div class="pop-up-register__buttons add-purchase">
                <button type="button" class="button md-fba-small">
                    <span class="material-symbols-outlined icon md-fba-icon">
                        shopping_cart
                    </span>
                </button>
                <button type="button" class="button button-text">Nova compra</button>
            </div>
        `;

        pop_up_register.classList.add("pop-up-register");
        container_button_register.appendChild(pop_up_register);

        const pay_bill_button = pop_up_register.querySelector('.pay-bill');
        const add_purchase_button = pop_up_register.querySelector('.add-purchase');

        pay_bill_button.addEventListener('click', function() {
            removePopUp()
            console.log('Botão de pagar fatura clicado');
        });
        add_purchase_button.addEventListener('click', function() {
            removePopUp()
            pop_up.classList.add("active")
            const window = windowPopUp("Nova compra")
            window.innerHTML += `
            <form class="credit-card-bills__register-purchase"> 
                <div class="credit-card-bills__form-element">
                    <label for="descriptionPurchase">Descrição</label>
                    <input type="text" class="descriptionPurchase" name="descriptionPurchase" required>
                </div>

                <div class="credit-card-bills__form-element">
                    <label for="datePurchase">Data</label>
                    <input type="date" class="datePurchase" name="datePurchase" required>
                </div>

                <div class="credit-card-bills__form-element">
                    <label for="valuePurchase">Preço</label>
                    <input type="number" class="valuePurchase" name="valuePurchase" required>
                </div>

                <div class="credit-card-bills__form-element">
                    <label for="categoriaPurchase">Categoria</label>
                    <select class="categoriaPurchase" name="categoriaPurchase"></select>
                </div>
                
                <div class="credit-card-bills__register-purchase-customers">
                    <div class="register-purchase-customers__container-header">
                        <label>Cliente</label>
                        <button type="button" class="register-purchase-customers__register-customers-button">
                            <span class="material-symbols-outlined icon button-icon">add</span>
                            <span class="button-text">Cadastrar cliente</span>
                        </button>
                    </div>
                    <select class="customersPurchase"></select>
                    <button type="button" class="register-purchase-customers__new-customers-button">
                        <span class="material-symbols-outlined icon button-icon">add</span>
                        <span class="button-text">Adicionar mais clientes</span>
                    </button>
                </div>
            </form>
            `
            pop_up.appendChild(window)
        });

        // Adicionar evento de clique para remover o pop-up
        pop_up.addEventListener("click", removePopUp);
        // Adicionar evento de clique na barra lateral para remover o pop-up
        sidebar.addEventListener("click", popRegisterSidebarDel);
    }

    if (pop_up_register) {
        removePopUp();
    } else {
        addPopUp();
    }

    // Função para remover o pop-up se o clique ocorrer fora da área do botão
    function popRegisterSidebarDel(e) {
        if (e.target != container_button_register && !container_button_register.contains(e.target)) {
            removePopUp();
        }
    }
})