export interface Publication {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  link: string;
  year: string;
}

const API_BASE_URL = "https://xqb2zf5n-5000.asse.devtunnels.ms/api";

function mapToPublication(raw: any): Publication {
  return {
    id: raw.PMCID,
    title: raw.Title,
    authors: raw.Authors || [],
    abstract: raw.Abstract || "",
    link: raw.DOI?.startsWith("http") ? raw.DOI : `https://www.ncbi.nlm.nih.gov/pmc/articles/${raw.PMCID}/`,
    year: raw.PublicationDate
      ? new Date(raw.PublicationDate).getFullYear().toString()
      : "Unknown",
  };
}

export async function getPapers(page = 1, limit = 9) {
  const res = await fetch(`${API_BASE_URL}/get_papers?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error(`Error ${res.status}: Failed to fetch papers`);
  const data = await res.json();

  return {
    ...data,
    papers: data.papers.map(mapToPublication),
  };
}

export async function getPaper(pmcid: string) {
  const res = await fetch(`${API_BASE_URL}/get_paper/${pmcid}`, {
    headers: {
      Authorization: "Basic " + btoa("pj:pj"),
    },
  });
  if (!res.ok) throw new Error(`Error ${res.status}: Paper not found`);
  const raw = await res.json();
  return mapToPublication(raw);
}

export async function searchPapers(query: string, page = 1, limit = 9) {
  const res = await fetch(`${API_BASE_URL}/search_papers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, page, limit }),
  });

  if (!res.ok) throw new Error(`Error ${res.status}: Failed to search papers`);

  const data = await res.json();

  const fullPapers = await Promise.all(
    data.papers.map((r: any) => getPaper(r.PMCID))
  );

  return {
    papers: fullPapers,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
}

export async function askChatbot(query: string, top_k = 10) {
  const res = await fetch(`${API_BASE_URL}/chatbot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, top_k }),
  });

  if (!res.ok) throw new Error(`Error ${res.status}: Failed to get chatbot response`);

  const data = await res.json();

  return {
    summary: data.summary,
    retrievedChunks: data.retrieved_chunks,
  };
}

export async function chatbotAsk(query: string, link: string) {
  const res = await fetch(`${API_BASE_URL}/chatbot/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, link }),
  });

  if (!res.ok) throw new Error(`Error ${res.status}: Failed to get chatbot response`);

  const data = await res.json();

  return {
    link: data.Link,
    query: data.Query,
    answer: data.Answer,
  };
}
