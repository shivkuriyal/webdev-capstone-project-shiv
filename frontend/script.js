// sir full marks dedo please
var SUPABASE_URL = "https://fvkclxhfwkhqbeqhcsqc.supabase.co";
var SUPABASE_KEY = "sb_publishable_3X1p1gJyfXPMadwGjJEWXQ_BML3zD9V";
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

var chartInstance = null;
var incExpChartInstance = null;
var allExpenses = [];

function getData() {
    supabase.from("expenses").select("*").then(function (result) {
        if (result.error) {
            console.error("Error fetching data:", result.error);
            allExpenses = [];
        } else {
            allExpenses = result.data;
        }
        if (document.getElementById("cards-container")) {
            calculateStats(allExpenses);
            calculateBalance(allExpenses);
            main(allExpenses);
        }
    });
}

function main(arr) {
    var container = document.getElementById("cards-container");
    container.innerHTML = "";

    if (arr.length === 0) {
        var msg = document.createElement("p");
        msg.className = "empty-message";
        msg.innerHTML = "No entries found. Start adding some!";
        container.appendChild(msg);
    } else {
        for (var i = 0; i < arr.length; i++) {
            var card = document.createElement("div");
            card.className = "expense-card";

            var entryType = arr[i].type || "expense";
            var amountClass = entryType === "income" ? "amount-income" : "amount-expense";
            var typeBadgeClass = entryType === "income" ? "type-badge-income" : "type-badge-expense";

            card.innerHTML =
                '<div class="card-header-row">' +
                '<h3>' + arr[i].title + '</h3>' +
                '<span class="type-badge ' + typeBadgeClass + '">' + entryType.toUpperCase() + '</span>' +
                '</div>' +
                '<p class="expense-amount ' + amountClass + '">' + (entryType === "income" ? "+" : "-") + '₹' + Number(arr[i].amount).toFixed(2) + '</p>' +
                '<span class="expense-category">' + arr[i].category + '</span>' +
                '<p class="card-date">📅 ' + arr[i].date + '</p>' +
                '<div class="card-buttons">' +
                '<button class="btn-edit" onclick="handleEdit(' + arr[i].id + ')">Edit</button>' +
                '<button class="btn-delete" onclick="handleDeleteExpense(' + arr[i].id + ')">Delete</button>' +
                '</div>';

            container.appendChild(card);
        }
    }

    renderChart(arr);
    renderIncomeExpenseChart(arr);
}

function calculateBalance(arr) {
    var totalIncome = 0;
    var totalExpense = 0;

    for (var i = 0; i < arr.length; i++) {
        var entryType = arr[i].type || "expense";
        var amt = Number(arr[i].amount);

        if (entryType === "income") {
            totalIncome = totalIncome + amt;
        } else {
            totalExpense = totalExpense + amt;
        }
    }

    var netBalance = totalIncome - totalExpense;

    document.getElementById("total-income").innerHTML = "₹" + totalIncome.toFixed(2);
    document.getElementById("total-expense").innerHTML = "₹" + totalExpense.toFixed(2);

    var netEl = document.getElementById("net-balance");
    netEl.innerHTML = "₹" + netBalance.toFixed(2);

    if (netBalance >= 0) {
        netEl.className = "balance-value income-color";
    } else {
        netEl.className = "balance-value expense-color";
    }
}

function calculateStats(arr) {
    var today = new Date();
    var todayStr = today.toISOString().split("T")[0];

    var dayOfWeek = today.getDay();
    var mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    var weekStart = new Date(today);
    weekStart.setDate(today.getDate() - mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    var thisMonth = today.getMonth();
    var thisYear = today.getFullYear();

    var todayTotal = 0;
    var weekTotal = 0;
    var monthTotal = 0;
    var yearTotal = 0;

    for (var i = 0; i < arr.length; i++) {
        var entryType = arr[i].type || "expense";
        if (entryType !== "expense") { continue; }

        var amt = Number(arr[i].amount);
        var entryDate = new Date(arr[i].date);

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

    document.getElementById("stat-today").innerHTML = "₹" + todayTotal.toFixed(2);
    document.getElementById("stat-week").innerHTML = "₹" + weekTotal.toFixed(2);
    document.getElementById("stat-month").innerHTML = "₹" + monthTotal.toFixed(2);
    document.getElementById("stat-year").innerHTML = "₹" + yearTotal.toFixed(2);
}

function renderChart(arr) {
    var categoryTotals = {};

    for (var i = 0; i < arr.length; i++) {
        var entryType = arr[i].type || "expense";
        if (entryType !== "expense") continue;

        var cat = arr[i].category;
        var amt = Number(arr[i].amount);

        if (categoryTotals[cat]) {
            categoryTotals[cat] = categoryTotals[cat] + amt;
        } else {
            categoryTotals[cat] = amt;
        }
    }

    var labels = Object.keys(categoryTotals);
    var values = Object.values(categoryTotals);
    var colors = ["#1a3c8f", "#dc2626", "#16a34a", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

    if (chartInstance) { chartInstance.destroy(); }

    var ctx = document.getElementById("expense-chart").getContext("2d");

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
    var totalIncome = 0;
    var totalExpense = 0;

    for (var i = 0; i < arr.length; i++) {
        var entryType = arr[i].type || "expense";
        var amt = Number(arr[i].amount);

        if (entryType === "income") {
            totalIncome = totalIncome + amt;
        } else {
            totalExpense = totalExpense + amt;
        }
    }

    if (incExpChartInstance) { incExpChartInstance.destroy(); }

    var ctx = document.getElementById("income-expense-chart").getContext("2d");

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
    var confirmed = confirm("Are you sure you want to delete this entry?");
    if (!confirmed) return;

    supabase.from("expenses").delete().eq("id", id).then(function (result) {
        if (result.error) {
            alert("Error deleting: " + result.error.message);
        } else {
            getData();
        }
    });
}

function handleEdit(id) {
    window.open("edit-expense.html?id=" + id, "_self");
}

function applyFilters() {
    var selectedType = document.getElementById("type-filter").value;
    var selectedCategory = document.getElementById("category-filter").value;

    var filtered = allExpenses;

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
    var form = document.getElementById("add-expense-form");
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        var type = document.getElementById("type").value;
        var title = document.getElementById("title").value;
        var amount = parseFloat(document.getElementById("amount").value);
        var category = document.getElementById("category").value;
        var date = document.getElementById("date").value;
        if (amount <= 0) { alert("Amount must be greater than 0!"); return; }

        var newExpense = {
            type: type, title: title,
            amount: amount, category: category, date: date
        };

        supabase.from("expenses").insert(newExpense).then(function (result) {
            if (result.error) {
                alert("Error adding entry: " + result.error.message);
            } else {
                alert("Entry added!");
                window.location.href = "index.html";
            }
        });
    });
}

function initEditExpensePage() {
    var queryParams = new URLSearchParams(window.location.search);
    var urlExpenseId = Number(queryParams.get("id"));

    supabase.from("expenses").select("*").eq("id", urlExpenseId).then(function (result) {
        if (result.error || result.data.length === 0) {
            alert("Expense not found");
            return;
        }
        var foundExpense = result.data[0];
        document.getElementById("type").value = foundExpense.type || "expense";
        document.getElementById("title").value = foundExpense.title;
        document.getElementById("amount").value = Number(foundExpense.amount);
        document.getElementById("category").value = foundExpense.category;
        document.getElementById("date").value = foundExpense.date;
    });

    var form = document.getElementById("edit-expense-form");
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        var type = document.getElementById("type").value;
        var title = document.getElementById("title").value;
        var amount = parseFloat(document.getElementById("amount").value);
        var category = document.getElementById("category").value;
        var date = document.getElementById("date").value;
        if (amount <= 0) { alert("Amount must be greater than 0!"); return; }

        var updatedData = {
            type: type, title: title,
            amount: amount, category: category, date: date
        };

        supabase.from("expenses").update(updatedData).eq("id", urlExpenseId).then(function (result) {
            if (result.error) {
                alert("Error updating: " + result.error.message);
            } else {
                alert("Entry updated!");
                window.location.href = "index.html";
            }
        });
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
