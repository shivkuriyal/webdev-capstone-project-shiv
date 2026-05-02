# ============================================================
# app.py — Flask Backend for Expense Tracker
# ============================================================
# This file creates a REST API that connects to Supabase
# and handles all CRUD operations for expenses.
# ============================================================

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create Flask app and enable CORS (so frontend can call backend)
app = Flask(__name__)
CORS(app)

# Read Supabase credentials from environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Create Supabase client to interact with the database
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


# ============================================================
# ROUTE 1: GET /expenses — Fetch all expenses
# ============================================================
@app.route("/expenses", methods=["GET"])
def get_expenses():
    """Fetch all expenses from the Supabase 'expenses' table."""
    response = supabase.table("expenses").select("*").execute()
    return jsonify({"expenses": response.data})


# ============================================================
# ROUTE 2: POST /expenses — Add a new expense
# ============================================================
@app.route("/expenses", methods=["POST"])
def add_expense():
    """Add a new expense or income entry to the database."""
    # Get JSON data from the request body
    data = request.get_json()

    # Extract fields from the request
    title = data.get("title")
    amount = data.get("amount")
    category = data.get("category")
    date = data.get("date")
    entry_type = data.get("type", "expense")  # Default to "expense" if not provided

    # --- Validation ---
    # Check that title is provided
    if not title:
        return jsonify({"error": "Title is required"}), 400

    # Check that amount is provided and is greater than 0
    if amount is None or float(amount) <= 0:
        return jsonify({"error": "Amount is required and must be greater than 0"}), 400

    # Check that category is provided
    if not category:
        return jsonify({"error": "Category is required"}), 400

    # Check that date is provided
    if not date:
        return jsonify({"error": "Date is required"}), 400

    # Validate type field — must be "income" or "expense"
    if entry_type not in ["income", "expense"]:
        return jsonify({"error": "Type must be 'income' or 'expense'"}), 400

    # Build the expense object to insert
    new_expense = {
        "title": title,
        "amount": float(amount),  # Store as a number, not a string
        "category": category,
        "date": date,
        "type": entry_type  # "income" or "expense"
    }

    try:
        # Insert into Supabase
        response = supabase.table("expenses").insert(new_expense).execute()
        return jsonify({"expense": response.data[0]}), 201
    except Exception as e:
        error_msg = str(e)
        if "type' column" in error_msg:
            return jsonify({"error": "Please add a 'type' column to your Supabase table first!"}), 400
        return jsonify({"error": "Database error: " + error_msg}), 500


# ============================================================
# ROUTE 3: DELETE /expenses/<id> — Delete an expense
# ============================================================
@app.route("/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    """Delete an expense by its ID."""
    # First, check if the expense exists
    check = supabase.table("expenses").select("*").eq("id", expense_id).execute()

    if len(check.data) == 0:
        return jsonify({"error": "Expense not found"}), 404

    # Delete the expense from Supabase
    supabase.table("expenses").delete().eq("id", expense_id).execute()

    return jsonify({"message": "Expense deleted successfully"})


# ============================================================
# ROUTE 4: PATCH /expenses/<id> — Update an expense
# ============================================================
@app.route("/expenses/<int:expense_id>", methods=["PATCH"])
def update_expense(expense_id):
    """Update an existing expense by its ID."""
    # Get JSON data from the request body
    data = request.get_json()

    # Validate: if amount is present, it must be > 0
    if "amount" in data:
        if float(data["amount"]) <= 0:
            return jsonify({"error": "Amount must be greater than 0"}), 400
        data["amount"] = float(data["amount"])  # Ensure it's stored as a number

    # Validate: if type is present, it must be "income" or "expense"
    if "type" in data:
        if data["type"] not in ["income", "expense"]:
            return jsonify({"error": "Type must be 'income' or 'expense'"}), 400

    # Check if the expense exists
    check = supabase.table("expenses").select("*").eq("id", expense_id).execute()

    if len(check.data) == 0:
        return jsonify({"error": "Expense not found"}), 404

    try:
        # Update the expense in Supabase
        response = supabase.table("expenses").update(data).eq("id", expense_id).execute()

        return jsonify({
            "message": "Expense updated successfully",
            "expense": response.data[0]
        })
    except Exception as e:
        error_msg = str(e)
        if "type' column" in error_msg:
            return jsonify({"error": "Please add a 'type' column to your Supabase table first!"}), 400
        return jsonify({"error": "Database error: " + error_msg}), 500


# ============================================================
# ROUTE 5: GET /expenses/search?category=Food — Search by category
# ============================================================
@app.route("/expenses/search", methods=["GET"])
def search_expenses():
    """Filter expenses by category using query parameter."""
    # Get the category from the URL query string
    category = request.args.get("category")

    if not category:
        return jsonify({"error": "Category query parameter is required"}), 400

    # Use Supabase .eq() to filter by category
    response = supabase.table("expenses").select("*").eq("category", category).execute()

    return jsonify({"expenses": response.data})


# ============================================================
# Run the Flask app on port 5001
# ============================================================
if __name__ == "__main__":
    app.run(debug=True, port=5001)
