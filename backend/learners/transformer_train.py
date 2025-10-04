from sentence_transformers import SentenceTransformer
import pandas as pd
import faiss

# Load CSV
df = pd.read_csv("papers.csv")

# Model for embeddings
model = SentenceTransformer('all-MiniLM-L6-v2')

# Combine fields
texts = (df['Title'] + " " + df['Summary'] + " " + df['Keywords']).tolist()

# Create embeddings
embeddings = model.encode(texts, convert_to_numpy=True)

# Store in FAISS
index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(embeddings)

def search(query, top_k=5):
    query_vec = model.encode([query], convert_to_numpy=True)
    D, I = index.search(query_vec, top_k)
    return df.iloc[I[0]][['Title','Summary','Keywords']]

# Save FAISS index
faiss.write_index(index, "papers.index")

# Save dataframe (if needed for mapping results later)
df.to_csv("papers_processed.csv", index=False)

