require('dotenv').config();
const moment = require('moment');
const Decimal = require('decimal.js');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

let customersData = [];
let cardsData = [];
let categoriesData = [];
let cardsTransactionsData = [];
let billsData = [];

function readFile(fullDir) {
    return new Promise((resolve, reject) => {
        fs.readFile(fullDir, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

(async () => {
    try {
        customersData = await readFile("data/customers.json");
        cardsData = await readFile("data/credit_cards.json");
        categoriesData = await readFile("data/categories.json");
        cardsTransactionsData = await readFile("data/cards_transactions.json");
        billsData = await readFile("data/bills.json");

        // Iniciar o servidor somente após carregar todos os dados
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });

    } catch (error) {
        console.error(error);
    }
})();


function generateUUIDWithData(data) {
    // Concatenando os dados para formar uma string única
    const dataString = Object.values(data).join('');
    // Gerando o hash a partir da string concatenada
    const hash = uuidv4(dataString);
    return hash;
}

function calcInstallment(total, installments, index){

    // Converter o total e a parcela para Decimal
   const decimalTotal = new Decimal(total)
   const decimalInstallments = new Decimal(installments)

   // Calcular o valor da parcela
   let valInstallment = decimalTotal.div(decimalInstallments).toDecimalPlaces(2, Decimal.ROUND_DOWN)
   
   // Calcular o total das parcelas
   const totalInstallments = valInstallment.times(decimalInstallments).toDecimalPlaces(2, Decimal.ROUND_DOWN)

    // Calcular o resto
   let rest = Number(decimalTotal.minus(totalInstallments).toDecimalPlaces(2, Decimal.ROUND_DOWN).modulo(1).toString().split(".")[1])

   // Criar objeto para armazenar o valor de cada parcela
   const valInstallments = {};
   if (rest > 0) {
       let count = 1
       while (rest > 0) {
           valInstallments[count] = valInstallments[count] ? valInstallments[count].plus(0.01).toDecimalPlaces(2, Decimal.ROUND_DOWN) : new Decimal(0.01);
           if(count == installments) {
               count = 1
           }
           else {
               count++
           }
           rest--
       }
   }

   //Adicionar resto apenas a parcela existentente
   if (valInstallments[index]) {
       valInstallment = valInstallment.plus(valInstallments[index]);
   }

   //Converter para 2 decimais
   valInstallment = valInstallment.toDecimalPlaces(2, Decimal.ROUND_DOWN);
  
   return valInstallment.toNumber();
}

async function generateBills() {
    return new Promise((resolve, reject) => {
        let firtsDate;
        let lastDate;
        billsData.forEach(bill => {
            if (!firtsDate || moment(bill.due_date).isBefore(firtsDate)) {
                firtsDate = moment(bill.due_date);
            }
            if (!lastDate || moment(bill.due_date).isAfter(lastDate)) {
                lastDate = moment(bill.due_date);
            }
        });
        let diffInMonths = lastDate.diff(firtsDate, 'months');
        for (let index = 0; index <= diffInMonths; index++) {
            const current_date = firtsDate.clone().add(index, 'months');
            cardsData.forEach(card => {
                const exist = billsData.findIndex(bill => card.id === bill.card_id && moment(bill.due_date).format("YYYY-MM") === moment(current_date).format("YYYY-MM"))
                if (exist < 0) {
                    const close_day = card.close_day;
                    const due_day = card.due_day;
                    let monthCloseIncrement = due_day > close_day ? 0 : -1;
                    const due_date_bill = current_date.clone().set("date", due_day).format("YYYY-MM-DD");
                    const close_day_bill = current_date.clone().add(monthCloseIncrement, "months").set("date", close_day).format("YYYY-MM-DD");
                    billsData.push({
                        "due_date": due_date_bill,
                        "close_date": close_day_bill,
                        "state": moment().format("YYYY-MM") === current_date.format("YYYY-MM") ? "open" : moment() > current_date ? "closed" : "future",
                        "paid": 0,
                        "card_id": card.id,
                        "total_balance": 0,
                        "items": []
                    });
                }
            });
        }
        fs.writeFile('data/bills.json', JSON.stringify(billsData, null, 2), err => {
            if (err) {
                console.error("Erro ao escrever dados de fatura:", err);
                reject("Erro ao escrever dados de fatura:");
            } else {
                console.log("Dados de fatura foram salvos com sucesso.");
                resolve("Dados de fatura foram salvos com sucesso.");
            }
        });
    });
}

app.post('/api/bills/generate', async (req, res) => {
    try {
        const result = await generateBills();
        res.status(200).json({ result: result });
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

// Rota para buscar todas as faturas
app.get('/api/bills', (req, res) => {
    const billsFiltered = billsData.flatMap(bill => {
        const { items, ...details} = bill
        return details
    })
    res.json(billsFiltered);
});

// Rota para buscar todas as faturas
app.get('/api/bills/items', (req, res) => {

    const billsFiltered = billsData.flatMap(bill => {
        const card = cardsData.find(card => card.id === bill.card_id);
        if (card) {
            return bill.items.map(item => {
                item.due_date = bill.due_date
                item.card_id = card.id;
                item.card_name = card.name;
                return item;
            });
        } else {
            return [];
        }
    });

    // Enviar as faturas filtradas como resposta
    res.json(billsFiltered);
});


// Rota para buscar faturas com base no ano e mês fornecidos
app.get('/api/bills/:year/:month/items', (req, res) => {
    // Extrair o ano e mês dos parâmetros da URL
    const { year, month } = req.params;

    // Filtrar as faturas com base no ano e mês fornecidos
    const billsCurrent = billsData.filter(bill => {
        // Verificar se a fatura está no mesmo ano e mês
        return moment(bill.due_date).format("YYYY-MM") === moment(`${year}-${month.length < 2 ? "0" + month : month}-01`).format("YYYY-MM");
    });

    const billsFiltered = billsCurrent.flatMap(bill => {
        const card = cardsData.find(card => card.id === bill.card_id);
        if (card) {
            return bill.items.map(item => {
                item.card_id = card.id;
                item.card_name = card.name;
                return item;
            });
        } else {
            return [];
        }
    });

    // Enviar as faturas filtradas como resposta
    res.json(billsFiltered);
});

// Rota para buscar faturas com base no ano e mês fornecidos
app.get('/api/bills/:year/:month', (req, res) => {
    // Extrair o ano e mês dos parâmetros da URL
    const { year, month } = req.params;

    // Filtrar as faturas com base no ano e mês fornecidos
    const billsCurrent = billsData.filter(bill => {
        // Verificar se a fatura está no mesmo ano e mês
        return moment(bill.due_date).format("YYYY-MM") === moment(`${year}-${month}-01`).format("YYYY-MM");
    });

    // Enviar as faturas filtradas como resposta
    res.json(billsCurrent);
});

// Rota para obter os dados dos cartões de crédito
app.get('/api/cards_transactions', (req, res) => {
    res.json(cardsTransactionsData);
});

app.post('/api/cards_transactions', (req, res) => {

    // Extrair os dados da requisição
    let { description, date, category_id, card_id, installments, amount, details } = req.body;

    // Verificar se todos os campos obrigatórios estão presentes
    if (!description || !date || !category_id || !card_id || !installments || !details) {
        return res.status(400).json({ error: "Argumento não passado." });
    }
    // Verificar se 'details' é um array
    else if (!Array.isArray(details)) {
        return res.status(400).json({details, error: "Argumento incorreto passado." });
    }

    // Encontrar a categoria e o cartão correspondentes aos IDs fornecidos
    const category = categoriesData.filter(category => category.id === category_id)[0];
    const card = cardsData.filter(card => card.id === card_id)[0];

    // Verificar se a categoria e o cartão existem
    if (!category) {
        return res.status(400).json({category, error: "Argumento incorreto passado para category_id." });
    }

    if (!card) {
        return res.status(400).json({card, error: "Argumento incorreto passado para card_id." });
    }

    // Construir o objeto de transação básico
    const transaction = { description, date, category_id, category: category.name, card_id, amount, installments };
    transaction.id = generateUUIDWithData(transaction);
    let transactions = [];

    let amountAccumulate = amount;

    details.forEach((detail, index) => {

        // Verificar se 'customer_id' está presente em cada detalhe
        if (!detail.customer_id) {
            return res.status(400).json({detail, error: "Argumento incorreto passado em details." });
        }

        // Encontrar o cliente correspondente ao ID fornecido
        const customer = customersData.filter(customer => customer.id === detail.customer_id)[0];

        // Verificar se o cliente existe
        if (!customer) {
            return res.status(400).json({customer_id: detail.customer_id ,error: "Argumento incorreto passado para customer_id." });
        }

        let amountCurrent = calcInstallment(amount, details.length, index + 1);

        // Verificar se 'amount' está presente em cada detalhe
        if (detail.amount) {
            // Verificar se o valor fornecido é maior que o total da transação
            if (amount < detail.amount) {
                return res.status(400).json({ error: "Valor maior que o total." });
            }
            // Subtrair o valor do detalhe do total da transação
            amountAccumulate -= detail.amount;
            amountCurrent = detail.amount;
        } else {
            // Se 'amount' não estiver presente, distribuir o valor restante
            if (index === (details.length - 1) && amountAccumulate != amountCurrent) {
                amountCurrent = amountAccumulate;
                amountAccumulate -= amountCurrent;
            } else {
                amountAccumulate -= amountCurrent;
            }
        }

        // Verificar se a soma dos valores passados é diferente do total
        if (amountAccumulate < 0 || (index === (details.length - 1) && amountAccumulate > 0)) {
            return res.status(400).json({ error: "A soma dos valores passados é diferente do total." });
        }

        // Construir o objeto de transação para cada detalhe
        transactions.push({ ...transaction, customer_id: detail.customer_id, customer: customer.name, amount: amountCurrent });
    });

    // Faz uma cópia dos dados de transações de cartão para uso posterior
    const cardsTransactionsDataBkp = cardsTransactionsData;

    // Para cada transação, realizar as seguintes operações
    transactions.forEach(transaction => {
        // Desestruturação para extrair informações relevantes da transação
        const { customer: customer_current, customer_id: customer_id_current, category: category_current, ...card_transaction } = transaction;

        // Converter o valor da transação para centavos
        card_transaction.amount = card_transaction.amount * 100;

        // Adicionar a transação aos dados de transações de cartão
        cardsTransactionsData.push(card_transaction);

        // Remover informações desnecessárias e adicionar outras à transação para uso em faturas
        const { date, amount, id: transaction_id, card_id: card_id_Current, ...bill_transaction } = card_transaction;
        bill_transaction.customer_id = customer_id_current;
        bill_transaction.customer = customer_current;
        bill_transaction.category = category_current;
        bill_transaction.transaction_id = transaction_id;

        // Calcular datas de vencimento e fechamento das faturas para cada parcela
        const current_date = moment(transaction.date);
        for (let index = 0; index < installments; index++) {
            bill_transaction.amount = calcInstallment(transaction.amount, installments, index + 1) * 100;
            const current_day = Number(current_date.clone().format("DD"));
            const close_day = card.close_day;
            const due_day = card.due_day;
            let monthDueIncrement = 0;
            let monthCloseIncrement = 0;

            // Lógica para determinar incrementos de mês com base no dia atual e nos dias de vencimento e fechamento
            if (current_day >= close_day || close_day > due_day) {
                monthDueIncrement = 1;
                monthCloseIncrement = current_day >= close_day ? 1 : 0;
            }

            if (current_day >= close_day && due_day < close_day) {
                monthDueIncrement = 2;
                monthCloseIncrement = current_day > due_day ? 1 : -1;
            }

            // Calcular as datas de vencimento e fechamento da fatura
            const due_date_bill = current_date.clone().add(monthDueIncrement, "months").set("date", due_day).format("YYYY-MM-DD");
            const close_day_bill = current_date.clone().add(monthCloseIncrement, "months").set("date", close_day).format("YYYY-MM-DD");

            // Adicionar informações adicionais à transação da fatura
            bill_transaction.installment = index + 1;
            bill_transaction.installment_date = current_date.format("YYYY-MM-DD");
            bill_transaction.id = generateUUIDWithData(bill_transaction);

            // Verificar se já existe uma fatura para o cartão e data de vencimento fornecidos
            const indexBill = billsData.findIndex(bill => bill.card_id === transaction.card_id && bill.due_date === due_date_bill);

            // Atualizar a fatura existente ou criar uma nova fatura
            if (indexBill > -1) {
                // Atualizar uma fatura existente com a nova transação
                const { items, total_balance, ...bill_details } = billsData[indexBill];
                items.push({ ...bill_transaction });

                // Calcular o novo saldo total da fatura
                const decimal_total_balance = new Decimal(total_balance / 100);
                const decimal_amount = new Decimal(bill_transaction.amount / 100);
                const total = decimal_total_balance.plus(decimal_amount).toDecimalPlaces(2, Decimal.ROUND_DOWN);
                billsData[indexBill] = { ...bill_details, "total_balance": total * 100, items };
            } else {
                // Criar uma nova fatura com a transação atual
                billsData.push({
                    "due_date": due_date_bill,
                    "close_date": close_day_bill,
                    "state": moment().format("YYYY-MM") === current_date.format("YYYY-MM") ? "open" : moment() > current_date ? "closed" : "future",
                    "paid": 0,
                    "card_id": transaction.card_id,
                    "total_balance": bill_transaction.amount,
                    "items": [{ ...bill_transaction }]
                });
            }

            // Avançar para o próximo mês
            current_date.add(1, "month");
        }
    });

   // Escrever os dados de transações de cartão em um arquivo JSON
    fs.writeFile('data/cards_transactions.json', JSON.stringify(cardsTransactionsData, null, 2), err => {
        if (err) {
            // Se ocorrer um erro ao escrever os dados, registrar o erro e enviar uma resposta de erro
            console.error("Erro ao escrever dados de transações de cartão:", err);
            res.status(500).send('Erro ao adicionar transação');
            return;
        }
    });

    // Escrever os dados de faturas em um arquivo JSON
    fs.writeFile('data/bills.json', JSON.stringify(billsData, null, 2), err => {
        if (err) {
            // Se ocorrer um erro ao escrever os dados, registrar o erro e enviar uma resposta de erro
            console.error("Erro ao escrever dados de faturas:", err);
            res.status(500).send('Erro ao adicionar transação');

            // Restaurar os dados originais de transações de cartão em caso de erro
            fs.writeFile('data/cards_transactions.json', JSON.stringify(cardsTransactionsDataBkp, null, 2), err => {
                if (err) {
                    console.error("Erro ao restaurar dados de transações de cartão:", err);
                    res.status(500).send('Erro ao adicionar transação');
                    return;
                }
            });
            return;
        }
        // Se os dados foram escritos com sucesso, enviar uma resposta de sucesso junto com as transações processadas
        res.status(201).json(transactions);
    });
});

// Rota para cartão de crédito
app.get('/api/cards', (req, res) => {
    res.json(cardsData)
});

// Rota para adicionar um novo cartão
app.post('/api/cards', (req, res) => {
    // Extrair os dados do corpo da requisição
    const {name, cards_limit, due_day, close_day} = req.body;

    // Verificar se todos os campos obrigatórios foram passados
    if(!name || !cards_limit || !due_day || !close_day){
        return res.status(400).json({name, cards_limit, due_day, close_day, error: "Argumento não passado."});
    }

    // Verificar se o nome do cartão já existe
    if (cardsData.some(card => card.name === String(name).toLowerCase())){
        return res.status(400).json({name, error: "Cartão já existe."}) 
    }

    // Criar um novo objeto de cartão com os dados fornecidos
    const newCard = { "name": String(name).toLowerCase(), cards_limit, due_day, close_day, status: 1}

    // Gerar um ID único para o novo cartão
    newCard.id = generateUUIDWithData(newCard)

    // Adicionar o novo cartão aos dados existentes de cartões
    cardsData.push(newCard);

    // Escrever os dados atualizados de cartões em um arquivo JSON
    fs.writeFile('data/credit_cards.json', JSON.stringify(cardsData, null, 2), err => {
        if (err) {
            // Se ocorrer um erro ao escrever os dados, registrar o erro e enviar uma resposta de erro
            console.error(err);
            res.status(500).send('Erro ao adicionar um novo cartão de crédito');
            return;
        }
        // Se os dados foram escritos com sucesso, enviar uma resposta de sucesso junto com os dados do novo cartão
        res.status(201).json(newCard);
    });
});

// Rota para cliente    
app.get('/api/customers', (req, res) => {
    res.json(customersData);
})


// Rota para adicionar um novo cliente
app.post('/api/customers', (req, res) => {
    // Extrair os dados do corpo da requisição
    const { name, phone } = req.body;

    // Verificar se todos os campos obrigatórios foram passados
    if(!name || !phone){
        return res.status(400).json({name,phone, error: "Argumento não passado."});
    }
    // Verificar se o nome é muito curto
    else if(String(name).length < 3) {
        return res.status(400).json({name,phone, error: "Nome muito curto."});
    }
    // Verificar se o número de telefone está no formato correto
    else if(!(/^\d{13}$/).test(phone)) {
        return res.status(400).json({name,phone, error: "Numero de telefone incorreto."});
    }

    // Verificar se o número de telefone já está cadastrado
    if (customersData.some(customer => customer.phone === phone)){
        return res.status(400).json({name,phone, error: "Numero de telefone já cadastrado"});
    }

    // Criar um novo objeto de cliente com os dados fornecidos
    const newCustomer = { "name": String(name).toLowerCase(), phone, "status": 1 };

    // Gerar um ID único para o novo cliente
    newCustomer.id = generateUUIDWithData(newCustomer)

    // Adicionar o novo cliente aos dados existentes de clientes
    customersData.push(newCustomer);
    
    // Escrever os dados atualizados de clientes em um arquivo JSON
    fs.writeFile('data/customers.json', JSON.stringify(customersData, null, 2), err => {
        if (err) {
            // Se ocorrer um erro ao escrever os dados, registrar o erro e enviar uma resposta de erro
            console.error(err);
            res.status(500).send('Erro ao adicionar um novo cliente');
            return;
        }
        // Se os dados foram escritos com sucesso, enviar uma resposta de sucesso junto com os dados do novo cliente
        res.status(201).json(newCustomer);
    });
})

// Rota para categorias
app.get('/api/categories', (req, res) => {
    res.json(categoriesData)
});

// Rota para adicionar uma nova categoria
app.post('/api/categories', (req, res) => {
    // Extrair os dados do corpo da requisição
    const {name, icon, color} = req.body;

    // Verificar se os campos obrigatórios foram passados
    if(!name || !icon ){
        return res.status(400).json({name, icon, error: "Argumento não passado."});
    }

    // Criar um novo objeto de categoria com os dados fornecidos
    const newCategory = {"name": String(name).toLowerCase(), icon, color, status: 1}

    // Gerar um ID único para a nova categoria
    newCategory.id = generateUUIDWithData(newCategory)

    // Adicionar a nova categoria aos dados existentes de categorias
    categoriesData.push(newCategory);

    // Escrever os dados atualizados de categorias em um arquivo JSON
    fs.writeFile('data/categories.json', JSON.stringify(categoriesData, null, 2), err => {
        if (err) {
            // Se ocorrer um erro ao escrever os dados, registrar o erro e enviar uma resposta de erro
            console.error(err);
            res.status(500).send('Erro ao adicionar uma nova categoria');
            return;
        }
        // Se os dados foram escritos com sucesso, enviar uma resposta de sucesso junto com os dados da nova categoria
        res.status(201).json(newCategory);
    });
});

