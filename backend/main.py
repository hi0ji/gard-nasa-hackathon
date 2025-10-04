from flask import Flask, jsonify, request
import json, os
from auth import auth
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
from google import genai
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
CHAT_MODEL = "gemini-2.5-flash"
TOP_K = 3

# Initialize Gemini client
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

model = SentenceTransformer("all-MiniLM-L6-v2")
index = faiss.read_index("model/new_papers.index")

with open("model/new_papers_metadata.pkl", "rb") as f:
    metadata = pickle.load(f)

df = pd.read_csv("data/papers_csv.csv")



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

def expand_query_with_gemini(query: str, num_words: int = 3):
    """
    Uses Gemini to expand a query with related words.
    Example: 'rat' -> ['rat', 'mouse', 'mice', 'rodent']
    """
    prompt = (
        f"Give me {num_words} plain English synonyms or closely related words to '{query}', "
        "suitable for searching scientific papers. Return only a comma-separated list without explanation."
    )

    # Use the new Gemini API v1 call
    response = gemini_client.models.generate_content(
        model=CHAT_MODEL,
        contents=prompt
    )

    # Split by comma and clean up
    related = [w.strip() for w in response.text.split(",") if w.strip()]

    # Ensure original query is included
    if query not in related:
        related.insert(0, query)

    return related

# @app.route("/api/search_papers", methods=["POST"])
# def search_papers():
#     data = request.json
#     query = data.get("query", "")
#     k = int(data.get("k", 5))

#     if not query:
#         return jsonify({"error": "Missing query"}), 400

#     # Expand query with Gemini
#     expanded_words = expand_query_with_gemini(query, num_words=3)

#     # Score each title by how many expanded words it contains
#     scores = []
#     for _, row in df.iterrows():
#         title = str(row["Title"]).lower()
#         match_count = sum(1 for w in expanded_words if w.lower() in title)
#         if match_count > 0:
#             scores.append((match_count, row))

#     scores.sort(key=lambda x: x[0], reverse=True)

#     results = []
#     for match_count, row in scores:
#         results.append({
#             "PMCID": row["PMCID"],
#             "Title": row["Title"],
#             "MatchScore": match_count,
#             "ExpandedWords": expanded_words
#         })

#     return jsonify({"query": query, "total_results": len(results), "results": results})
@app.route("/api/search_papers", methods=["POST"])
def search_papers():
    data = request.json
    query = data.get("query", "")
    page = int(data.get("page", 1))
    limit = int(data.get("limit", 9))

    if not query:
        return jsonify({"error": "Missing query"}), 400

    expanded_words = expand_query_with_gemini(query, num_words=3)

    # Score titles
    scores = []
    for _, row in df.iterrows():
        title = str(row["Title"]).lower()
        match_count = sum(1 for w in expanded_words if w.lower() in title)
        if match_count > 0:
            scores.append((match_count, row))

    scores.sort(key=lambda x: x[0], reverse=True)

    # Paginate
    start = (page - 1) * limit
    end = start + limit
    total = len(scores)
    page_scores = scores[start:end]

    papers = []
    for match_count, row in page_scores:
        papers.append({
            "PMCID": row["PMCID"],
            "Title": row["Title"],
            "MatchScore": match_count,
            "ExpandedWords": expanded_words
        })

    return jsonify({
        "query": query,
        "page": page,
        "limit": limit,
        "total": total,
        "has_next": end < total,
        "has_prev": page > 1,
        "next_page": page + 1 if end < total else None,
        "prev_page": page - 1 if page > 1 else None,
        "papers": papers
    })






def embed_text(texts):
    """Get embeddings using SentenceTransformer"""
    if isinstance(texts, str):
        texts = [texts]
    embeddings = model.encode(texts, convert_to_numpy=True)
    return embeddings.astype("float32")

def evaluate_and_summarize(chunks, query):
    """
    Use Gemini to:
    1. Evaluate relevance of FAISS chunks
    2. Optionally refine query
    3. Summarize findings clearly and concisely
    """
    context_text = "\n\n".join([f"[{c['title']} | {c['section']}]\n{c['chunk_text']}" for c in chunks])

    prompt = f"""
    You are a Research Assistant that helps users find relevant academic literature. You are connected to a FAISS vector database that returns chunks of text from possible sources.

    Follow these rules:

    Understand the user’s query. Infer what type of research the user is looking for.

    Evaluate FAISS chunks carefully. The chunks may be inaccurate, loosely related, or irrelevant. Do not blindly trust them.

    Refine query once if needed. If the initial FAISS chunks seem unrelated or insufficient, reformulate the user’s query into a clearer, more precise research query and re-query FAISS only once. After that, continue with the results you have.

    Build the final answer.

    If relevant sources are found, summarize and synthesize them clearly, citing which chunks they came from.

    If the chunks are not relevant, be transparent: explain that no directly related results were found, but still provide the returned chunks as references.

    Be clear, concise, and act like a careful research assistant. Do not overclaim. Always distinguish between relevant findings and weak/irrelevant matches.

    User query: "{query}"

    FAISS chunks:
    {context_text}
    """

    response = gemini_client.models.generate_content(
        model=CHAT_MODEL,
        contents=prompt
    )
    return response.text

@app.route("/api/chatbot", methods=["POST"])
def chatbot():
    data = request.json
    query = data.get("query", "")
    top_k = int(data.get("top_k", TOP_K))

    if not query:
        return jsonify({"error": "Missing query"}), 400
    
    # Step 1: Embed query
    query_vec = embed_text(query)

    # Step 2: Retrieve top FAISS chunks
    D, I = index.search(query_vec, top_k)
    retrieved_chunks = [metadata[idx] for idx in I[0]]

    # Step 3: Ask Gemini to evaluate and summarize
    summary = evaluate_and_summarize(retrieved_chunks, query)

    # Step 4: Format retrieved chunks
    results = []
    for chunk in retrieved_chunks:
        results.append({
            "title": chunk["title"],
            "authors": chunk.get("authors", []),
            "section": chunk.get("section", ""),
            "doi": chunk.get("doi", ""),
            "url": chunk.get("url", ""),
            # "chunk_text": chunk.get("chunk_text", "")
        })

    # Step 5: Return JSON
    return jsonify({
        "query": query,
        "summary": summary,
        "retrieved_chunks": results
    })

# Main
if __name__ == "__main__":
    app.run(debug=True, use_reloader=True, port=5000)