from flask import Flask, render_template
import json
from flask import jsonify

app = Flask(__name__) 

with open("data/papers.json", "r", encoding="utf-8") as f:
    papers = json.load(f)

# Routes
@app.route("/")
def main():
    return "Hello Main"

@app.route("/test")
def test():
    return "Flask is working!"

@app.route("/api/get_paper/<pmcid>", methods=["GET"])
def get_paper(pmcid):
    paper = next((p for p in papers if p["PMCID"] == pmcid), None)
    
    if paper:
        return jsonify(paper)
    else:
        return jsonify({"error": "Paper not found"}), 404

# Main
if __name__ == "__main__":
    app.run(debug=True, use_reloader=True, port=5000)