from flask import Flask, jsonify, request
import json, os
from auth import auth

# Application configs
app = Flask(__name__) 
# Todo: wrap this into the .env 
app.config["SITE_USER"] = "pj"
app.config["SITE_PASS"] = "pj"


with open("data/papers.json", "r", encoding="utf-8") as f:
    papers = json.load(f)

# API Routes

# Gets all data from the json list
@app.route("/api/get_papers", methods=["GET"])
def get_papers():
    # Pagination 
    # query params
    page = int(request.args.get("page", 1))   # default page 1
    limit = int(request.args.get("limit", 10)) # default 10 per page

    start = (page - 1) * limit
    end = start + limit
    total = len(papers)

    response = [
        {
            "PMCID": p.get("PMCID"),
            "Title": p.get("Title"),
            "Authors": p.get("Authors"),
            "Journal": p.get("Journal"),
            "PublicationDate": p.get("PublicationDate"),
            "URL": p.get("URL"),
            "DOI": p.get("DOI"),
            "Abstract": next((s.get("text") 
                              for s in p.get("Sections", [])
                                             if s.get("title") == "Abstract"), None)   
        }
        for p in papers[start:end]
    ]
    # Query: /api/get_papers?page=2&limit=5
    return jsonify({
        "page": page,
        "limit": limit,
        "total": total,
        "has_next": end < total,
        "has_prev": page > 1,
        "next_page": page + 1 if end < total else None,
        "prev_page": page - 1 if page > 1 else None,
        "papers": response
    })


@app.route("/api/get_paper/<pmcid>", methods=["GET"])
@auth
def get_paper(pmcid):
    paper = next((p for p in papers if p["PMCID"] == pmcid), None)
    if paper:
        response = {
            "PMCID": paper.get("PMCID"),
            "Title": paper.get("Title"),
            "Authors": paper.get("Authors"),
            "Journal": paper.get("Journal"),
            "PublicationDate": paper.get("PublicationDate"),
            "URL": paper.get("URL"),
            "DOI": paper.get("DOI"),
            "Abstract": next((s.get("text") 
                              for s in paper.get("Sections", [])
                                             if s.get("title") == "Abstract"), None)  
        }
        return jsonify(response)
    else:
        return jsonify({"error": "Paper not found"}), 404

@app.route("/api/search_related_paper/<query>", methods=["GET"])
def search_related_paper(query):
    return None

# Main
if __name__ == "__main__":
    app.run(debug=True, use_reloader=True, port=5000)