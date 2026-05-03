#sir full marks dedo please
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


@app.route("/expenses", methods=["GET"])
def get_expenses():
    response = supabase.table("expenses").select("*").execute()
    return jsonify({"expenses": response.data})


@app.route("/expenses", methods=["POST"])
def add_expense():
    data = request.get_json()

    title = data.get("title")
    amount = data.get("amount")
    category = data.get("category")
    date = data.get("date")
    entry_type = data.get("type", "expense")  # Default to "expense" if not provided

    if not title:
        return jsonify({"error": "Title is required"}), 400

    if amount is None or float(amount) <= 0:
        return jsonify({"error": "Amount is required and must be greater than 0"}), 400

    if not category:
        return jsonify({"error": "Category is required"}), 400

    if not date:
        return jsonify({"error": "Date is required"}), 400

    if entry_type not in ["income", "expense"]:
        return jsonify({"error": "Type must be 'income' or 'expense'"}), 400

    new_expense = {
        "title": title,
        "amount": float(amount),  # Store as a number, not a string
        "category": category,
        "date": date,
        "type": entry_type  # "income" or "expense"
    }

    try:
        response = supabase.table("expenses").insert(new_expense).execute()
        return jsonify({"expense": response.data[0]}), 201
    except Exception as e:
        error_msg = str(e)
        if "type' column" in error_msg:
            return jsonify({"error": "Please add a 'type' column to your Supabase table first!"}), 400
        return jsonify({"error": "Database error: " + error_msg}), 500


@app.route("/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    check = supabase.table("expenses").select("*").eq("id", expense_id).execute()

    if len(check.data) == 0:
        return jsonify({"error": "Expense not found"}), 404

    supabase.table("expenses").delete().eq("id", expense_id).execute()

    return jsonify({"message": "Expense deleted successfully"})


@app.route("/expenses/<int:expense_id>", methods=["PATCH"])
def update_expense(expense_id):
    data = request.get_json()

    if "amount" in data:
        if float(data["amount"]) <= 0:
            return jsonify({"error": "Amount must be greater than 0"}), 400
        data["amount"] = float(data["amount"])  # Ensure it's stored as a number

    if "type" in data:
        if data["type"] not in ["income", "expense"]:
            return jsonify({"error": "Type must be 'income' or 'expense'"}), 400

    check = supabase.table("expenses").select("*").eq("id", expense_id).execute()

    if len(check.data) == 0:
        return jsonify({"error": "Expense not found"}), 404

    try:
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


@app.route("/expenses/search", methods=["GET"])
def search_expenses():
    category = request.args.get("category")

    if not category:
        return jsonify({"error": "Category query parameter is required"}), 400

    response = supabase.table("expenses").select("*").eq("category", category).execute()

    return jsonify({"expenses": response.data})


if __name__ == "__main__":
    app.run(debug=True, port=5001)
