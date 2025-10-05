import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Copy } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { chatbotAsk } from "@/services/apiService";
import TextareaAutosize from "react-textarea-autosize";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Synthesize = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [summaryContent, setSummaryContent] = useState<string>("");
  const [followUpMessages, setFollowUpMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [wordCount, setWordCount] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [followUpMessages]);

  useEffect(() => {
    const fetchSummary = async () => {
      const state = location.state as any;
      const pub = state?.publication;
      if (!pub) return navigate("/home");

      try {
        setIsSummaryLoading(true);
        const res = await chatbotAsk("help summarize the paper", pub.link);
        const text = res.answer || "No summary received.";
        setSummaryContent(text);
        setWordCount(text.trim().split(/\s+/).length);
      } catch (err) {
        console.error("❌ Failed to summarize:", err);
        setSummaryContent("⚠️ Failed to summarize the paper.");
        setWordCount(0);
      } finally {
        setIsSummaryLoading(false);
      }
    };

    fetchSummary();
  }, [location.state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setFollowUpMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);
    setIsLoading(true);

    try {
      const pub = (location.state as any)?.publication;
      const res = await chatbotAsk(userMessage, pub?.link || "");
      setFollowUpMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.answer || "No response received." },
      ]);
    } catch {
      setFollowUpMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Failed to get response from chatbot." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summaryContent) return;
    navigator.clipboard.writeText(summaryContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-white overflow-hidden">
      {/* ==== MAIN CONTENT ==== */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 py-6 max-w-7xl mx-auto w-full overflow-hidden">
        {/* ===== SUMMARY BOX ===== */}
        <div className="bg-[#1A1F3C] rounded-2xl p-6 flex flex-col shadow-md h-[80vh] overflow-hidden relative">
          {/* Header with Copy and Word Count */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#E5E7FF]">Summary</h2>
            <div className="flex items-center gap-3 text-sm text-[#9FA3D9] relative">
              <span>{wordCount} words</span>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="hover:bg-[#2C3261] rounded-full p-2 relative"
                  title="Copy summary"
                >
                  <Copy className="h-4 w-4 text-[#E5E7FF]" />
                </Button>

                {/* Tooltip */}
                {copied && (
                  <div className="absolute -top-8 right-0 bg-[#2C3261] text-xs text-[#E5E7FF] px-2 py-1 rounded-md shadow-md animate-fade-in">
                    Copied!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary content */}
          <ScrollArea className="flex-1 rounded-md pr-2 overflow-y-auto">
            <div className="text-sm leading-relaxed text-[#C9CCEE] whitespace-pre-wrap break-words">
              {isSummaryLoading ? (
                <p className="text-[#9FA3D9]">Loading summary...</p>
              ) : (
                <div className="whitespace-pre-wrap break-words">
                  {summaryContent}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* ===== FOLLOW-UP CHAT BOX ===== */}
        <div className="flex flex-col bg-[#1A1F3C] rounded-2xl p-6 shadow-md h-[80vh] overflow-hidden">
          <h2 className="text-lg font-bold mb-4 text-[#E5E7FF]">
            Follow-up Questions
          </h2>

          <ScrollArea className="flex-1 rounded-md pr-2 overflow-y-auto">
            <div className="space-y-4 text-sm break-words">
              {followUpMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed break-words ${
                      msg.role === "user"
                        ? "bg-[#2C3261] text-[#E5E7FF] rounded-br-none"
                        : "bg-[#323863] text-[#C9CCEE] rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
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
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* ==== FIXED INPUT BAR ==== */}
      <div className="w-full px-4 py-4 fixed bottom-0 left-0 right-0 bg-transparent">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto px-4 flex items-end gap-3"
        >
          <TextareaAutosize
            value={input}
            onChange={(e) => setInput(e.target.value)}
            minRows={1}
            maxRows={6}
            placeholder="Ask more about this paper..."
            
            className="resize-none max-h-40 overflow-y-auto rounded-2xl w-[calc(100%-72px)] px-4 py-3 bg-muted text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
            className="h-12 w-12 rounded-full bg-[#4A55E2] hover:bg-[#5E6BFF] transition"
          >
            <Send className="h-5 w-5 text-white" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Synthesize;
