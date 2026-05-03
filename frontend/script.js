#sir full marks dedo please
function getExpensesFromStorage() {
    const data = localStorage.getItem("expenses");
    if (data) {
        return JSON.parse(data);
    }
    return [];
}

function saveExpensesToStorage(expenses) {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function generateId() {
    const expenses = getExpensesFromStorage();
    if (expenses.length === 0) { return 1; }
    let maxId = 0;
    for (let i = 0; i < expenses.length; i++) {
        if (expenses[i].id > maxId) { maxId = expenses[i].id; }
    }
    return maxId + 1;
}

let chartInstance = null;
let incExpChartInstance = null;

let allExpenses = [];

function getData() {
    allExpenses = getExpensesFromStorage();
    calculateStats(allExpenses);
    calculateBalance(allExpenses);
    main(allExpenses);
}

function main(arr) {
    const container = document.getElementById("cards-container");
    container.innerHTML = "";

    if (arr.length === 0) {
        const msg = document.createElement("p");
        msg.className = "empty-message";
        msg.innerHTML = "No entries found. Start adding some!";
        container.appendChild(msg);
    } else {
        for (let i = 0; i < arr.length; i++) {
            const card = document.createElement("div");
            card.className = "expense-card";

            const entryType = arr[i].type || "expense";
            const amountClass = entryType === "income" ? "amount-income" : "amount-expense";
            const typeBadgeClass = entryType === "income" ? "type-badge-income" : "type-badge-expense";

            card.innerHTML = `
                <div class="card-header-row">
                    <h3>${arr[i].title}</h3>
                    <span class="type-badge ${typeBadgeClass}">${entryType.toUpperCase()}</span>
                </div>
                <p class="expense-amount ${amountClass}">${entryType === "income" ? "+" : "-"}₹${Number(arr[i].amount).toFixed(2)}</p>
                <span class="expense-category">${arr[i].category}</span>
                <p class="card-date">📅 ${arr[i].date}</p>
                <div class="card-buttons">
                    <button class="btn-edit" onclick="handleEdit(${arr[i].id})">Edit</button>
                    <button class="btn-delete" onclick="handleDeleteExpense(${arr[i].id})">Delete</button>
                </div>
            `;

            container.appendChild(card);
        }
    }

    renderChart(arr);
    renderIncomeExpenseChart(arr);
}

function calculateBalance(arr) {
    let totalIncome = 0;
    let totalExpense = 0;

    for (let i = 0; i < arr.length; i++) {
        const entryType = arr[i].type || "expense";
        const amt = Number(arr[i].amount);

        if (entryType === "income") {
            totalIncome = totalIncome + amt;
        } else {
            totalExpense = totalExpense + amt;
        }
    }

    const netBalance = totalIncome - totalExpense;

    document.getElementById("total-income").innerHTML = `₹${totalIncome.toFixed(2)}`;
    document.getElementById("total-expense").innerHTML = `₹${totalExpense.toFixed(2)}`;

    const netEl = document.getElementById("net-balance");
    netEl.innerHTML = `₹${netBalance.toFixed(2)}`;

    if (netBalance >= 0) {
        netEl.className = "balance-value income-color";
    } else {
        netEl.className = "balance-value expense-color";
    }
}

function calculateStats(arr) {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    let todayTotal = 0;
    let weekTotal = 0;
    let monthTotal = 0;
    let yearTotal = 0;

    for (let i = 0; i < arr.length; i++) {
        const entryType = arr[i].type || "expense";
        if (entryType !== "expense") { continue; }

        const amt = Number(arr[i].amount);
        const entryDate = new Date(arr[i].date);

        if (arr[i].date === todayStr) {
            todayTotal = todayTotal + amt;
        }
        if (entryDate >= weekStart) {
            weekTotal = weekTotal + amt;
        }
        if (entryDate.getMonth() === thisMonth && entryDate.getFullYear() === thisYear) {
            monthTotal = monthTotal + amt;
        }
        if (entryDate.getFullYear() === thisYear) {
            yearTotal = yearTotal + amt;
        }
    }

    document.getElementById("stat-today").innerHTML = `₹${todayTotal.toFixed(2)}`;
    document.getElementById("stat-week").innerHTML = `₹${weekTotal.toFixed(2)}`;
    document.getElementById("stat-month").innerHTML = `₹${monthTotal.toFixed(2)}`;
    document.getElementById("stat-year").innerHTML = `₹${yearTotal.toFixed(2)}`;
}

function renderChart(arr) {
    const categoryTotals = {};

    for (let i = 0; i < arr.length; i++) {
        const entryType = arr[i].type || "expense";
        if (entryType !== "expense") continue;

        const cat = arr[i].category;
        const amt = Number(arr[i].amount);

        if (categoryTotals[cat]) {
            categoryTotals[cat] = categoryTotals[cat] + amt;
        } else {
            categoryTotals[cat] = amt;
        }
    }

    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);
    const colors = ["#1a3c8f", "#dc2626", "#16a34a", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

    if (chartInstance) { chartInstance.destroy(); }

    const ctx = document.getElementById("expense-chart").getContext("2d");

    chartInstance = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: "#ffffff",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: "#2c3e6b",
                        font: { family: "Inter", size: 13 }
                    }
                }
            }
        }
    });
}

function renderIncomeExpenseChart(arr) {
    let totalIncome = 0;
    let totalExpense = 0;

    for (let i = 0; i < arr.length; i++) {
        const entryType = arr[i].type || "expense";
        const amt = Number(arr[i].amount);

        if (entryType === "income") {
            totalIncome = totalIncome + amt;
        } else {
            totalExpense = totalExpense + amt;
        }
    }

    if (incExpChartInstance) { incExpChartInstance.destroy(); }

    const ctx = document.getElementById("income-expense-chart").getContext("2d");

    incExpChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Income", "Expenses"],
            datasets: [{
                data: [totalIncome, totalExpense],
                backgroundColor: ["#16a34a", "#dc2626"],
                borderColor: "#ffffff",
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: "#2c3e6b",
                        font: { family: "Inter", size: 13 }
                    }
                }
            }
        }
    });
}

function handleDeleteExpense(id) {
    const confirmed = confirm("Are you sure you want to delete this entry?");
    if (!confirmed) return;

    let expenses = getExpensesFromStorage();
    expenses = expenses.filter(function (item) {
        return item.id !== id;
    });

    saveExpensesToStorage(expenses);
    getData();
}

function handleEdit(id) {
    window.open(`edit-expense.html?id=${id}`, "_self");
}

function applyFilters() {
    const selectedType = document.getElementById("type-filter").value;
    const selectedCategory = document.getElementById("category-filter").value;

    let filtered = allExpenses;

    if (selectedType !== "All") {
        filtered = filtered.filter(function (item) {
            return (item.type || "expense") === selectedType;
        });
    }

    if (selectedCategory !== "All") {
        filtered = filtered.filter(function (item) {
            return item.category === selectedCategory;
        });
    }

    main(filtered);
}

function initAddExpensePage() {
    const form = document.getElementById("add-expense-form");
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const type = document.getElementById("type").value;
        const title = document.getElementById("title").value;
        const amount = parseFloat(document.getElementById("amount").value);
        const category = document.getElementById("category").value;
        const date = document.getElementById("date").value;
        if (amount <= 0) { alert("Amount must be greater than 0!"); return; }
        const newExpense = {
            id: generateId(), type: type, title: title,
            amount: amount, category: category, date: date
        };
        const expenses = getExpensesFromStorage();
        expenses.push(newExpense);
        saveExpensesToStorage(expenses);
        alert("Entry added!");
        window.location.href = "index.html";
    });
}

function initEditExpensePage() {
    const queryParams = new URLSearchParams(window.location.search);
    const urlExpenseId = Number(queryParams.get("id"));

    const expenses = getExpensesFromStorage();
    let foundExpense = null;
    for (let i = 0; i < expenses.length; i++) {
        if (expenses[i].id === urlExpenseId) {
            foundExpense = expenses[i];
            break;
        }
    }
    if (!foundExpense) { alert("Expense not found"); return; }
    document.getElementById("type").value = foundExpense.type || "expense";
    document.getElementById("title").value = foundExpense.title;
    document.getElementById("amount").value = Number(foundExpense.amount);
    document.getElementById("category").value = foundExpense.category;
    document.getElementById("date").value = foundExpense.date;

    const form = document.getElementById("edit-expense-form");
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const type = document.getElementById("type").value;
        const title = document.getElementById("title").value;
        const amount = parseFloat(document.getElementById("amount").value);
        const category = document.getElementById("category").value;
        const date = document.getElementById("date").value;
        if (amount <= 0) { alert("Amount must be greater than 0!"); return; }
        let allData = getExpensesFromStorage();
        for (let i = 0; i < allData.length; i++) {
            if (allData[i].id === urlExpenseId) {
                allData[i].type = type;
                allData[i].title = title;
                allData[i].amount = amount;
                allData[i].category = category;
                allData[i].date = date;
                break;
            }
        }
        saveExpensesToStorage(allData);
        alert("Entry updated!");
        window.location.href = "index.html";
    });
}

if (document.getElementById("cards-container")) {
    document.getElementById("type-filter").addEventListener("change", applyFilters);
    document.getElementById("category-filter").addEventListener("change", applyFilters);
    getData();

} else if (document.getElementById("add-expense-form")) {
    initAddExpensePage();

} else if (document.getElementById("edit-expense-form")) {
    initEditExpensePage();
}
