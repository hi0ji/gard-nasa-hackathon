from flask import Flask, jsonify, request
import json, os
from auth import auth
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
from dotenv import load_dotenv
import faiss
import numpy as np
import pandas as pd
from flask_cors import CORS
import pickle

# Application configs
app = Flask(__name__) 
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Todo: wrap this into the .env 
app.config["SITE_USER"] = "pj"
app.config["SITE_PASS"] = "pj"
load_dotenv()

with open("data/papers.json", "r", encoding="utf-8") as f:
    papers = json.load(f)

# Load FAISS and metadata
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = SentenceTransformer("all-MiniLM-L6-v2")
index = faiss.read_index("model/new_papers.index")

with open("model/new_papers_metadata.pkl", "rb") as f:
    metadata = pickle.load(f)




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
# @auth
def get_paper(pmcid):
    paper = next((p for p in papers if p["PMCID"] == pmcid), None)
    if paper:
        response = {
            "PMCID": paper.get("PMCID"),
            "Title": paper.get("Title"),
            "Authors": paper.get("Authors"),
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

@app.route("/api/search_papers", methods=["POST"])
def search_papers():
    data = request.json
    query = data.get("query", "")
    k = int(data.get("k", 5))

    if not query:
        return jsonify({"error": "Missing query"}), 400
    
    print("FAISS index size:", index.ntotal)
    # print("CSV rows:", len(df))

    # Convert query → embedding
    query_vec = model.encode([query], convert_to_numpy=True)
    D, I = index.search(query_vec, k)

    results = []
    retrieved_chunks = []

    for idx, score in zip(I[0], D[0]):
        meta = metadata[idx]  # <- each chunk has metadata
        results.append({
            "PMCID": meta.get("pmcid"),
            "Title": meta.get("title"),
            # "Section": meta.get("section"),
            # "ChunkText": meta.get("chunk_text"),
            "Score": float(score)
        })

        retrieved_chunks.append(
            f"[Paper: {meta.get('title')} | Section: {meta.get('section')}]"
            f"\n{meta.get('chunk_text')}"
        )

    # Combine into a context string for downstream tasks
    context = "\n\n".join(retrieved_chunks)

    return jsonify({
        "query": query,
        "results": results,
        "context": context
    })


# Main
if __name__ == "__main__":
    app.run(debug=True, use_reloader=True, port=5000)