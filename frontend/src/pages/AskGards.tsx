import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, Link2 } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { askChatbot } from "@/services/apiService";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  retrievedChunks?: RetrievedChunk[];
}

interface RetrievedChunk {
  title: string;
  authors?: string[];
  section?: string;
  doi?: string;
  url?: string;
}

const autoFormatMarkdown = (text: string): string => {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .join("\n");
};

const AskGards = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await askChatbot(userMessage);

      const summary = response.summary || "No summary was returned.";
      const retrievedChunks = response.retrievedChunks || [];

      const formattedSummary = autoFormatMarkdown(summary);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: formattedSummary,
          retrievedChunks,
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Oops! Something went wrong while getting a response. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* ==== CHAT MESSAGES ==== */}
      <div className="flex-1 px-4 py-6 pb-[140px] mx-auto w-full overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-full space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Ask GARDS
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Your AI-powered assistant for NASA bioscience research. Ask
              questions about publications, research insights, or summaries of
              research papers.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 mb-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-lg whitespace-pre-wrap break-words overflow-hidden text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <>
                      <div className="prose prose-sm prose-invert">
                        <ReactMarkdown
                          components={{
                            a: ({ node, ...props }) => (
                              <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline"
                              />
                            ),
                            p: ({ node, ...props }) => (
                              <p className="mb-1" {...props} />
                            ),
                            li: ({ node, ...props }) => (
                              <li className="mb-0.5" {...props} />
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>

                      {/* ==== Sources Section ==== */}
                      {message.retrievedChunks &&
                        message.retrievedChunks.length > 0 && (
                          <div className="mt-3 border-t border-border pt-2">
                            <p className="text-xs text-muted-foreground mb-1 font-semibold">
                              Sources:
                            </p>
                            <ul className="space-y-1">
                              {message.retrievedChunks.map((chunk, i) => (
                                <li key={i} className="text-xs leading-snug">
                                  <a
                                    href={chunk.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-1"
                                  >
                                    <Link2 className="w-3 h-3" />
                                    {chunk.title || "Untitled paper"}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 justify-start mb-4">
                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted">
                  <div className="flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span
                      className="animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    >
                      ●
                    </span>
                    <span
                      className="animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    >
                      ●
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ==== CHAT INPUT ==== */}
      <div className="w-full px-4 py-4 fixed bottom-0 left-0 right-0 bg-transparent">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <TextareaAutosize
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about NASA bioscience research..."
              className="resize-none max-h-40 overflow-y-auto rounded-2xl w-[calc(100%-72px)] px-4 py-3 bg-muted text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              minRows={1}
              maxRows={6}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-12 w-12 rounded-full transition"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AskGards;
