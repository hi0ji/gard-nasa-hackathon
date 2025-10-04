import streamlit as st
import faiss
import pickle
import numpy as np
import requests
from google import genai

# ------------------------
# CONFIG
# ------------------------
# LM Studio (local) for embeddings
LMSTUDIO_API = "http://localhost:1234/v1"
EMBED_MODEL = "text-embedding-all-minilm-l6-v2-embedding"

# Gemini for chat
API_KEY = "AIzaSyDbO2kSkUgxalssqbC10nnTwa8agucoL0E"
CHAT_MODEL = "gemini-2.5-flash"

TOP_K = 8

# Initialize Gemini client
gemini_client = genai.Client(api_key=API_KEY)

# ------------------------
# HELPERS
# ------------------------
def embed_text(texts):
    """Get embeddings from LM Studio API"""
    if isinstance(texts, str):
        texts = [texts]
    res = requests.post(
        f"{LMSTUDIO_API}/embeddings",
        json={"model": EMBED_MODEL, "input": texts}
    )
    embeddings = [np.array(item["embedding"], dtype="float32") for item in res.json()["data"]]
    return np.vstack(embeddings)

def chat_with_gemini(context, query):
    """Send retrieved chunks + query to Gemini chat model"""
    system_prompt = (
        "You are a research assistant. Answer the question based only on the provided chunks. "
        "If the answer is not in the context, say you do not know."
    )

    # Combine system + user messages into a single string
    prompt = f"{system_prompt}\n\nChunks:\n{context}\n\nQuestion: {query}"

    # Send to Gemini
    response = gemini_client.models.generate_content(
        model=CHAT_MODEL,
        contents=prompt
    )

    # Updated access for Gemini API v1
    return response.text


# ------------------------
# LOAD FAISS + METADATA
# ------------------------
st.title("📚 Research Paper Chatbot (LM Studio Embeddings + Gemini Chat)")

@st.cache_resource
def load_faiss_and_metadata():
    index = faiss.read_index("new_papers.index")
    with open("new_papers_metadata.pkl", "rb") as f:
        metadata = pickle.load(f)
    return index, metadata

index, metadata = load_faiss_and_metadata()

# ------------------------
# USER INPUT
# ------------------------
query = st.text_input("Ask a question about the papers:")
if query:
    # Embed query using LM Studio
    query_vec = embed_text(query)

    # Search FAISS
    D, I = index.search(query_vec, TOP_K)

    # Retrieve chunks with paper title and section
    retrieved_chunks = [
        f"[Paper: {metadata[idx]['title']} | Section: {metadata[idx]['section']}]"
        f"\n{metadata[idx]['chunk_text']}"
        for idx in I[0]
    ]

    # Combine context
    context = "\n\n".join(retrieved_chunks)

    # Ask Gemini chat model
    with st.spinner("Thinking..."):
        answer = chat_with_gemini(context, query)

    # Display answer
    st.subheader("💡 Answer")
    st.write(answer)

    st.subheader("📖 Sources / Retrieved Chunks")
    for i, chunk in enumerate(retrieved_chunks):
        st.text(f"--- Chunk {i} ---\n{chunk}\n")
