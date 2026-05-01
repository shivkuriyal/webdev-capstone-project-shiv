// getting all elements from HTML
let form = document.getElementById("expense-form");
let nameInput = document.getElementById("expense-name");
let amountInput = document.getElementById("expense-amount");
let categoryInput = document.getElementById("expense-category");
let totalDisplay = document.getElementById("total-amount");
let expenseList = document.getElementById("expense-list");
let incomeDisplay = document.getElementById("income-total");
let expenseDisplay = document.getElementById("expense-total");
let btnIncome = document.getElementById("btn-income");
let btnExpense = document.getElementById("btn-expense");
let submitBtn = document.getElementById("submit-btn");

// load saved data from localStorage, or start with empty array
let transactions = loadData();
let currentType = "income";

// save transactions to localStorage
function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// load transactions from localStorage
function loadData() {
    let saved = localStorage.getItem("transactions");
    if (saved) {
        return JSON.parse(saved);
    }
    return [];
}

// change the category dropdown options based on type
function updateCategories() {
    categoryInput.innerHTML = "";

    if (currentType === "income") {
        // income categories
        let incomeOptions = ["Salary", "Freelance", "Other"];
        for (let i = 0; i < incomeOptions.length; i++) {
            let option = document.createElement("option");
            option.value = incomeOptions[i];
            option.textContent = incomeOptions[i];
            categoryInput.appendChild(option);
        }
        nameInput.placeholder = "Description (e.g. Salary)";
    } else {
        // expense categories
        let expenseOptions = ["Food", "Travel", "Shopping", "Bills", "Other"];
        for (let i = 0; i < expenseOptions.length; i++) {
            let option = document.createElement("option");
            option.value = expenseOptions[i];
            option.textContent = expenseOptions[i];
            categoryInput.appendChild(option);
        }
        nameInput.placeholder = "Description (e.g. Coffee)";
    }
}

// switch to income mode
function setIncome() {
    currentType = "income";
    btnIncome.className = "type-btn active-income";
    btnExpense.className = "type-btn";
    submitBtn.className = "";
    submitBtn.textContent = "Add Income";
    updateCategories();
}

// switch to expense mode
function setExpense() {
    currentType = "expense";
    btnExpense.className = "type-btn active-expense";
    btnIncome.className = "type-btn";
    submitBtn.className = "expense-mode";
    submitBtn.textContent = "Add Expense";
    updateCategories();
}

// this runs when user submits the form
function addTransaction(event) {
    event.preventDefault();

    let name = nameInput.value.trim();
    let amount = Number(amountInput.value);
    let category = categoryInput.value;

    // basic validation
    if (name === "") {
        alert("Please enter a description.");
        return;
    }
    if (amount <= 0 || isNaN(amount)) {
        alert("Please enter a valid amount.");
        return;
    }

    // create new transaction and add to array
    let newTransaction = {
        id: Date.now(),
        name: name,
        amount: amount,
        category: category,
        type: currentType
    };

    transactions.push(newTransaction);
    saveData();
    renderList();
    updateTotals();
    form.reset();
    updateCategories();
}

// display all transactions on screen
function renderList() {
    expenseList.innerHTML = "";

    if (transactions.length === 0) {
        expenseList.innerHTML = '<li class="empty-msg">No transactions yet.</li>';
        return;
    }

    for (let i = 0; i < transactions.length; i++) {
        let t = transactions[i];
        let li = document.createElement("li");

        let sign = t.type === "income" ? "+" : "-";
        let colorClass = t.type === "income" ? "amount-green" : "amount-red";

        li.innerHTML = '<div>' +
            '<div class="item-name">' + t.name + '</div>' +
            '<div class="item-category">' + t.category + '</div>' +
            '</div>' +
            '<div>' +
            '<span class="' + colorClass + '">' + sign + ' ₹' + t.amount + '</span>' +
            '<button class="delete-btn" onclick="deleteTransaction(' + t.id + ')">✕</button>' +
            '</div>';

        expenseList.appendChild(li);
    }
}

// calculate and show totals
function updateTotals() {
    let totalIncome = 0;
    let totalExpense = 0;

    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].type === "income") {
            totalIncome = totalIncome + transactions[i].amount;
        } else {
            totalExpense = totalExpense + transactions[i].amount;
        }
    }

    let balance = totalIncome - totalExpense;

    totalDisplay.textContent = "₹" + balance;
    incomeDisplay.textContent = "₹" + totalIncome;
    expenseDisplay.textContent = "₹" + totalExpense;
}

// delete a transaction by id
function deleteTransaction(id) {
    transactions = transactions.filter(function(t) {
        return t.id !== id;
    });
    saveData();
    renderList();
    updateTotals();
}

// event listeners
btnIncome.addEventListener("click", setIncome);
btnExpense.addEventListener("click", setExpense);
form.addEventListener("submit", addTransaction);

// load and display data when page opens
renderList();
updateTotals();
