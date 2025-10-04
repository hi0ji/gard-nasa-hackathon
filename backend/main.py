from flask import Flask, render_template
import json, os
from auth import auth
from flask import jsonify

# Application configs
app = Flask(__name__) 
# Todo: wrap this into the .env 
app.config["SITE_USER"] = "pj"
app.config["SITE_PASS"] = "pj"


with open("data/old/papers.json", "r", encoding="utf-8") as f:
    papers = json.load(f)

# API Routes
@app.route("/api/get_paper/<pmcid>", methods=["GET"])
@auth
def get_paper(pmcid):
    paper = next((p for p in papers if p["PMCID"] == pmcid), None)
    
    if paper:
        return jsonify(paper)
    else:
        return jsonify({"error": "Paper not found"}), 404

# Main
if __name__ == "__main__":
    app.run(debug=True, use_reloader=True, port=5000)