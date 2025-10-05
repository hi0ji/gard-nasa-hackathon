from flask import Flask, jsonify, request
import json, os, pickle, requests, faiss, requests
from auth import auth
from sentence_transformers import SentenceTransformer
# import google.generativeai as genai
from google import genai
from google.genai.types import Tool, GenerateContentConfig
from dotenv import load_dotenv
import numpy as np
import pandas as pd
from flask_cors import CORS
from bs4 import BeautifulSoup
import re

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
TOP_K = 10
chats = {}

# Initialize Gemini client
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

model = SentenceTransformer("all-MiniLM-L6-v2")
index = faiss.read_index("model/new_papers.index")

with open("model/new_papers_metadata.pkl", "rb") as f:
    metadata = pickle.load(f)

df = pd.read_csv("data/papers_csv.csv")

SYSTEM_PROMPT = """
    You are GARD, a highly capable Research Assistant specialized in helping users find, understand, and analyze academic literature.
    You communicate like a well-trained researcher—clear, analytical, and precise.

    Your objectives are to:

    Understand the user’s academic intent — whether they want a summary, critique, methodological explanation, or discussion of implications.

    Think deeply and step-by-step through complex scientific or research-based questions.

    Provide truthful, evidence-based, and context-aware answers while keeping your tone scholarly yet approachable.

    📄 When a user provides a paper link (e.g., DOI or PMC):

    Read and analyze the paper carefully.

    Summarize or respond depending on the user’s intent:

    If the user wants a summary:

    Structure your answer as follows:

    Title – The paper’s title (if available).

    Overview – What the paper studies and its research goal.

    Key Topics and Findings – Bullet points summarizing core results, methods, and implications.

    Conclusion – Concise academic summary of the paper’s takeaway.

    If the user asks analytical questions (e.g., “Why did they use this method?”, “What are the impacts of this study?”, “What could have been improved?”):

    Methodology Reasoning – Explain why the researchers likely chose that method (refer to context, study design, and standard practice).

    Alternative Approaches – Briefly describe what other methods could have been used, and their pros/cons.

    Implications and Impact – Discuss how the study contributes to its field, real-world effects, and future research potential.

    Critical Insight – Offer a balanced academic interpretation, emphasizing both strengths and limitations.

    ⚠️ If the link is invalid or inaccessible:

    Politely say:

    “Please include a valid research paper link (like a PMC or DOI) so I can analyze it.”

    If access fails, respond:

    “I couldn’t access the full paper. Could you provide a different link or upload the text?”

    🎯 Writing Style Guidelines

    Be factual, clear, and concise — suitable for scholars, researchers, or graduate students.

    Avoid generic or vague explanations. Always explain the reasoning behind a paper’s methods, findings, or conclusions.

    Maintain an academic but approachable tone — insightful, nuanced, and evidence-driven.    
    """

# Functions
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
        You are GARD a Research Assistant that helps users find relevant academic literature. 
        You are a highly capable, thoughtful, and precise assistant. Your goal is to deeply understand the user's intent, think step-by-step through complex problems, provide clear and accurate answers, and proactively anticipate helpful follow-up information. Always prioritize being truthful, nuanced, insightful, and efficient.
        You are connected to a FAISS vector database that returns chunks of text from possible sources.

        Follow these rules:

        Understand the user’s query. Infer what type of research the user is looking for (e.g., mice-related studies, cell biology papers, etc.).

        Evaluate FAISS chunks carefully. The chunks may be inaccurate, loosely related, or irrelevant. Do not blindly trust them.

        Refine query once if needed. If the initial results seem unrelated or insufficient, reformulate the user’s query into a clearer, more precise research query and re-query only once. After that, continue with the results you have.

        Avoid duplicates. If the same paper or source appears more than once, list it only once.
        
        Build the final answer.
            Begin by briefly introducing what you found in relation to the user’s query (e.g., “I found a few papers that discuss this topic, though some are more directly relevant than others”).

            When listing results, explain each paper a little: what it studies, what methods or findings are highlighted, and why it may be relevant.

            If the results are not strongly relevant, be transparent: explain that no directly related sources were found, but share what was returned anyway in case it helps.

        Style.
            Speak as if you are addressing a student, researcher, or scholar.

            Be clear, concise, and professional.

            Do not use technical terms like “chunks” that might confuse the user.

            Always distinguish between highly relevant and weak/possibly irrelevant results.
            
        If relevant sources are found, summarize and synthesize them clearly, citing which paper they came from.

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
    page = int(data.get("page", 1))
    limit = int(data.get("limit", 9))

    if not query:
        return jsonify({"error": "Missing query"}), 400

    # Check if query is a link
    if "http" in query.lower():
        expanded_words = [query]  # no expansion, it's a URL
    else:
        expanded_words = expand_query_with_gemini(query, num_words=3)


    # Score titles
    scores = []
    searchable_fields = ["Title", "PMCID", "Authors", "PublicationDate", "URL"]

    for _, row in df.iterrows():
        match_count = 0

        for field in searchable_fields:
            value = str(row.get(field, "")).lower()
            match_count += sum(1 for w in expanded_words if w.lower() in value)

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

@app.route("/api/chatbot/ask", methods=["POST"])
def chatbot_ask():
    data = request.json
    query = data.get("query", "")
    link = data.get("link", "").strip()

    if not query:
        return jsonify({"error": "Missing query"}), 400

    if not link:
        return jsonify({
            "response": "Please include a valid research paper link (like a PMC or DOI) so I can analyze it."
        }), 400

    sys_prompt = SYSTEM_PROMPT + f"\n\nPaper URL: {link}\n\nUser question: {query}"
    
    response = gemini_client.models.generate_content(
        model=CHAT_MODEL,
        contents=sys_prompt,
        config=GenerateContentConfig(
            tools=[{"url_context": {}}]
            )
    )   

        # 🔹 Safely extract text answer
    if response and response.candidates:
        candidate = response.candidates[0]
        parts = getattr(candidate.content, "parts", [])
        # answer = "".join([getattr(p, "text", "") for p in parts]).strip()

        if parts:
            # ✅ Safely join only valid text parts
            answer = "".join([
                p.text for p in parts if p and getattr(p, "text", None)
            ]).strip()
        else:
            answer = "No textual content found in Gemini's response."

        # Url context metadata can be either a single object or a list — normalize to list
        raw_meta = getattr(candidate, "url_context_metadata", None)
        metas = []
        if raw_meta:
            if isinstance(raw_meta, (list, tuple)):
                metas = raw_meta
            else:
                metas = [raw_meta]
    else:
        answer = "No response received from Gemini."
        metas = []

    # 🔹 Build JSON-serializable references list and try to get the title
    references = []
    title = None
    for m in metas:
        # use getattr to avoid errors if attribute is missing
        url = getattr(m, "url", None) or getattr(m, "uri", None)
        mtitle = getattr(m, "title", None) or getattr(m, "name", None)
        desc = getattr(m, "description", None) or getattr(m, "snippet", None)

        references.append({
            "url": url,
            "title": mtitle,
            "description": desc
        })

        if not title and mtitle:
            title = mtitle

    # 🔹 Fallback: scrape the <title> tag from the page (simple regex, no bs4 required)
    if not title:
        try:
            headers = {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/128.0.0.0 Safari/537.36"
                )
            }
            r = requests.get(link, headers=headers, timeout=8)
            r.raise_for_status()
            m = re.search(r"<title>(.*?)</title>", r.text, re.I | re.S)
            if m:
                title = m.group(1).strip()
        except Exception:
            title = None

    # Final safe defaults
    if not title:
        title = "Unknown Title"

    return jsonify({
        "Link": link,
        "Query": query,
        "Title": title,
        "Answer": answer,
        "References": references
    })
    
# Main
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)