import React, { useState, useRef, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { sendChatMessage } from "../utils/api";
import { jsPDF } from "jspdf";

const ChatInterface = ({ isOpen, onClose, selectedProject }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Memoized to prevent ReactMarkdown from remounting table DOM on every render
  // (which would reset horizontal scroll position)
  const mdComponents = useMemo(
    () => ({
      table: ({ node, ...props }) => (
        <div
          className="w-full my-3"
          style={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorX: "contain",
          }}
        >
          <div className="min-w-[580px] border border-stone-200 dark:border-white/5 rounded-lg overflow-hidden">
            <table
              className="w-full text-left border-collapse text-[13px] bg-white dark:bg-[#111114]"
              {...props}
            />
          </div>
        </div>
      ),
      thead: ({ node, ...props }) => (
        <thead
          className="bg-stone-50 dark:bg-white/5 text-stone-700 dark:text-slate-200"
          {...props}
        />
      ),
      th: ({ node, ...props }) => (
        <th
          className="px-3 py-2.5 font-semibold border-b border-stone-200 dark:border-white/5 whitespace-nowrap text-xs uppercase tracking-wider"
          {...props}
        />
      ),
      td: ({ node, children, ...props }) => {
        // Detect date-like strings (e.g., "Mar 7, 9:04 AM") and split date/time onto two lines
        const text =
          typeof children === "string"
            ? children
            : Array.isArray(children)
              ? children.join("")
              : "";
        const dateTimeMatch = text.match(
          /^([A-Za-z]+ \d+),\s+(\d+:\d+ [AP]M)$/,
        );
        return (
          <td
            className="px-3 py-2.5 border-b border-stone-100 dark:border-slate-700 last:border-0 align-top"
            style={{ wordBreak: "break-word", maxWidth: "200px" }}
            {...props}
          >
            {dateTimeMatch ? (
              <span className="text-xs">
                <span className="block font-medium text-stone-700 dark:text-slate-300">
                  {dateTimeMatch[1]}
                </span>
                <span className="block text-stone-400 dark:text-slate-500">
                  {dateTimeMatch[2]}
                </span>
              </span>
            ) : (
              children
            )}
          </td>
        );
      },
      tbody: ({ node, ...props }) => (
        <tbody
          className="divide-y divide-stone-100 dark:divide-white/5"
          {...props}
        />
      ),
      tr: ({ node, ...props }) => (
        <tr
          className="hover:bg-stone-50 dark:hover:bg-white/10 transition-colors"
          {...props}
        />
      ),
      p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
      ul: ({ node, ...props }) => (
        <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />
      ),
      ol: ({ node, ...props }) => (
        <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />
      ),
      li: ({ node, ...props }) => <li className="" {...props} />,
      strong: ({ node, ...props }) => (
        <strong
          className="font-semibold text-purple-600 dark:text-purple-400"
          {...props}
        />
      ),
      code: ({ node, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || "");
        return !match ? (
          <code
            className={`bg-stone-100 dark:bg-white/10 px-1 py-0.5 rounded text-[13px] text-pink-600 dark:text-pink-400 font-mono ${className || ""}`}
            {...props}
          >
            {children}
          </code>
        ) : (
          <div className="bg-stone-100 dark:bg-white/5 p-3 rounded-lg overflow-x-auto mb-3 border border-stone-200 dark:border-white/5">
            <code
              className={`text-[13px] font-mono ${className || ""}`}
              {...props}
            >
              {children}
            </code>
          </div>
        );
      },
      h2: ({ node, ...props }) => (
        <h2
          className="text-base font-bold text-stone-800 dark:text-slate-100 mt-4 mb-2"
          {...props}
        />
      ),
      h3: ({ node, ...props }) => (
        <h3
          className="text-sm font-semibold text-stone-700 dark:text-slate-300 mt-3 mb-1.5"
          {...props}
        />
      ),
    }),
    [],
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Reset messages when project changes
  useEffect(() => {
    setMessages([
      {
        role: "ai",
        content: `Hello! I'm Nexus, your AI assistant for ${selectedProject?.name || "this project"}. I know about the last 30 days of activity here. What would you like to know?`,
        allowPDF: false,
      },
    ]);
  }, [selectedProject]);

  const handlePromptClick = (promptText, internalType) => {
    setInput(""); // Clear input since it triggers immediately
    handleDirectSend(promptText, internalType);
  };

  const handleDirectSend = async (text, internalType = null) => {
    if (!text.trim() || !selectedProject || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsLoading(true);

    try {
      const data = await sendChatMessage(
        selectedProject._id,
        text,
        internalType,
      );
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: data.response, allowPDF: data.allowPDF },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "error",
          content: "Sorry, I encountered an error fetching the response.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateChatPDF = () => {
    const chatText = messages
      .map((m) => `${m.role === "user" ? "You" : "Nexus"}:\n${m.content}`)
      .join("\n\n");
    generateTextPDF(
      chatText,
      `Chat_History_${selectedProject?.name || "Project"}`,
    );
  };

  const generateMessagePDF = (text) => {
    generateTextPDF(text, `Nexus_Report`);
  };

  const generateTextPDF = (text, title) => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = 210;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = 15;

      const checkPageBreak = (needed = 7) => {
        if (y + needed > 285) {
          pdf.addPage();
          y = 15;
        }
      };

      // Title
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 30, 30);
      pdf.text("Nexus Report", margin, y);
      y += 10;

      const raw =
        typeof text === "string" ? text : JSON.stringify(text, null, 2);
      // Clean markdown artifacts: strip bold **, italic *, backticks, html tags
      // We do this per-line in the processor below, but clean backticks globally first
      const lines = raw.replace(/`/g, "'").split("\n");

      let i = 0;
      while (i < lines.length) {
        const line = lines[i];

        // H2 heading
        if (line.startsWith("## ")) {
          checkPageBreak(10);
          pdf.setFontSize(13);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(55, 65, 200);
          pdf.text(line.replace(/^##\s*/, ""), margin, y);
          y += 7;
          pdf.setTextColor(30, 30, 30);
          i++;
          // H3 heading
        } else if (line.startsWith("### ")) {
          checkPageBreak(9);
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(80, 80, 80);
          pdf.text(line.replace(/^###\s*/, ""), margin, y);
          y += 6;
          pdf.setTextColor(30, 30, 30);
          i++;
          // Table detection
        } else if (line.startsWith("|")) {
          // Collect all table rows
          const tableLines = [];
          while (i < lines.length && lines[i].startsWith("|")) {
            tableLines.push(lines[i]);
            i++;
          }
          const parseRow = (r) =>
            r
              .split("|")
              .map((c) => c.trim())
              .filter(Boolean);
          const header = parseRow(tableLines[0]);
          const dataRows = tableLines.slice(2).map(parseRow); // skip separator row

          if (header.length > 0) {
            checkPageBreak(15);
            // Proportional widths: give more space to last column (Task)
            const numCols = header.length;
            let colWidths;
            if (numCols === 4) {
              // Date | User | Action | Task
              colWidths = [35, 35, 30, contentWidth - 100];
            } else {
              const baseW = contentWidth / numCols;
              colWidths = Array(numCols).fill(baseW);
            }

            // Table header bg
            pdf.setFillColor(235, 237, 250);
            pdf.rect(margin, y - 4, contentWidth, 8, "F");

            pdf.setFontSize(9);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(30, 30, 100);
            let xOff = margin;
            header.forEach((h, ci) => {
              pdf.text(h, xOff + 1, y);
              xOff += colWidths[ci];
            });
            y += 7;

            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(30, 30, 30);
            dataRows.forEach((row) => {
              // Strip all markdown markers from each cell
              const cleanRow = row.map((c) =>
                c
                  .replace(/\*\*/g, "") // bold
                  .replace(/(?<![\*])\*(?![\*])/g, "") // italic single *
                  .trim(),
              );

              // Calculate row height based on tallest cell
              let maxWraps = 1;
              cleanRow.forEach((cell, ci) => {
                const wrapped = pdf.splitTextToSize(
                  cell,
                  (colWidths[ci] || 30) - 3,
                );
                if (wrapped.length > maxWraps) maxWraps = wrapped.length;
              });
              const rowH = maxWraps * 5 + 4;
              checkPageBreak(rowH + 1);

              xOff = margin;
              cleanRow.forEach((cell, ci) => {
                const wrapped = pdf.splitTextToSize(
                  cell,
                  (colWidths[ci] || 30) - 3,
                );
                pdf.text(wrapped, xOff + 1.5, y);
                xOff += colWidths[ci] || 30;
              });
              y += rowH;
              // Draw divider AFTER advancing y (moved 6.5mm up to place it perfectly between rows)
              pdf.setDrawColor(210, 215, 235);
              pdf.line(margin, y - 6.5, margin + contentWidth, y - 6.5);
            });
            y += 2;
          }
          // Skip lone star lines (markdown artifact)
        } else if (line.trim() === "*" || line.trim() === "") {
          y += line.trim() ? 0 : 2; // blank line spacing
          i++;
          // Bullet
        } else if (
          line.startsWith("• ") ||
          line.startsWith("- ") ||
          line.match(/^\*\s/)
        ) {
          checkPageBreak(7);
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          const bulletText = line.replace(/^[•\-\*]\s*/, "");
          const cleanBullet = bulletText.replace(/\*\*/g, "");
          const wrapped = pdf.splitTextToSize(
            `• ${cleanBullet}`,
            contentWidth - 4,
          );
          pdf.setTextColor(30, 30, 30);
          pdf.text(wrapped, margin + 3, y);
          y += wrapped.length * 5 + 1;
          i++;
          // Separator line
        } else if (line.match(/^[-_]{3,}/)) {
          checkPageBreak(4);
          pdf.setDrawColor(200, 200, 200);
          pdf.line(margin, y, margin + contentWidth, y);
          y += 4;
          i++;
          // Regular paragraph (with inline bold support)
        } else if (line.trim()) {
          checkPageBreak(7);
          pdf.setFontSize(10);
          pdf.setTextColor(30, 30, 30);

          // Render inline bold: split by ** and alternate bold/normal
          const segments = line.split(/\*\*/);
          let xCursor = margin;
          segments.forEach((seg, si) => {
            const isBold = si % 2 === 1;
            pdf.setFont("helvetica", isBold ? "bold" : "normal");
            const wrapped = pdf.splitTextToSize(seg, contentWidth);
            // Only first segment starts at xCursor, subsequent lines reset to margin
            pdf.text(wrapped, xCursor, y);
            xCursor = margin; // subsequent segments always start new line for simplicity
            y += wrapped.length * 5;
          });
          y += 1;
          i++;
        } else {
          y += 3; // blank line spacing
          i++;
        }
      }

      pdf.save(`${title}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    handleDirectSend(input);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] md:w-[600px] bg-white dark:bg-[#0c0c0e] shadow-2xl flex flex-col z-50 border-l border-stone-200 dark:border-white/5 transition-transform duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-stone-200/50 dark:border-white/10 bg-white/50 dark:bg-[#0c0c0e]/50 backdrop-blur-md py-5 h-[72px]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full shadow-lg shadow-purple-500/10 overflow-hidden">
            <img
              src="/favicon.svg"
              className="w-full h-full object-cover rounded-full"
              alt="Nexus Logo"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="font-semibold text-stone-800 dark:text-slate-100 leading-tight">
              Nexus
            </h2>
            <span className="text-[10px] text-stone-500 dark:text-slate-400 font-medium">
              SyncCollab AI
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-200 dark:hover:bg-white/10 rounded-full text-stone-500 dark:text-slate-400 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#fafafa] dark:bg-[#0c0c0e]"
        ref={chatContainerRef}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col w-full ${msg.role === "user" ? "ml-auto items-end max-w-[85%]" : "mr-auto items-start max-w-full"}`}
          >
            <span className="text-[10px] text-stone-400 dark:text-slate-500 mb-1 px-1 uppercase tracking-wider font-semibold">
              {msg.role === "error"
                ? "System"
                : msg.role === "user"
                  ? "You"
                  : "AI"}
            </span>
            <div
              className={`px-4 py-3.5 rounded-2xl text-[14.5px] shadow-sm max-w-full ${
                msg.role === "user"
                  ? "bg-purple-600 text-white rounded-tr-sm shadow-purple-500/10 overflow-x-auto"
                  : msg.role === "error"
                    ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-tl-sm border border-red-100 dark:border-red-900/50 overflow-x-auto"
                    : "bg-white dark:bg-white/5 text-stone-800 dark:text-slate-200 rounded-tl-sm border border-stone-200/50 dark:border-white/5 backdrop-blur-sm overflow-x-visible"
              }`}
            >
              {msg.role === "user" ? (
                <p className="whitespace-pre-wrap">
                  {typeof msg.content === "string"
                    ? msg.content
                    : JSON.stringify(msg.content)}
                </p>
              ) : (
                <div className="text-sm dark:text-slate-200 leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={mdComponents}
                  >
                    {typeof msg.content === "string"
                      ? msg.content
                      : JSON.stringify(msg.content, null, 2)}
                  </ReactMarkdown>

                  {msg.role === "ai" && msg.allowPDF && (
                    <div className="mt-3 pt-3 border-t border-stone-200/50 dark:border-white/10 flex justify-end">
                      <button
                        onClick={() => generateMessagePDF(msg.content)}
                        className="flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download Report PDF
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col mr-auto items-start max-w-[85%]">
            <span className="text-[10px] text-stone-400 dark:text-slate-500 mb-1 px-1 uppercase tracking-wider font-semibold">
              Nexus
            </span>
            <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-white dark:bg-white/5 border border-stone-200/50 dark:border-white/5 shadow-sm backdrop-blur-sm flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full bg-purple-500/80 animate-pulse"
                style={{ animationDelay: "0ms", animationDuration: "1s" }}
              ></div>
              <div
                className="w-1.5 h-1.5 rounded-full bg-purple-500/80 animate-pulse"
                style={{ animationDelay: "300ms", animationDuration: "1s" }}
              ></div>
              <div
                className="w-1.5 h-1.5 rounded-full bg-purple-500/80 animate-pulse"
                style={{ animationDelay: "600ms", animationDuration: "1s" }}
              ></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#fafafa] dark:bg-[#0c0c0e] border-t border-stone-200/50 dark:border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          {/* Sample Prompts */}
          {messages.length <= 1 && !isLoading && (
            <div className="flex flex-wrap gap-2 items-center justify-center pb-2">
              <span className="text-xs text-stone-500 dark:text-slate-500 font-medium mr-1.5">
                Suggestions:
              </span>
              {[
                { text: "Provide a structured report", type: "report" },
                { text: "Summarize pending tasks", type: "summary" },
                { text: "What are the recent updates?", type: "updates" },
                { text: "Identify any blockers", type: "blockers" },
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handlePromptClick(prompt.text, prompt.type)}
                  className="px-3 py-1.5 text-xs font-medium rounded-full bg-white dark:bg-white/5 border border-stone-200 dark:border-white/5 text-stone-600 dark:text-slate-300 hover:border-purple-500 dark:hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-sm"
                >
                  {prompt.text}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Box */}
          <form
            onSubmit={handleSend}
            className="relative flex items-center bg-white dark:bg-white/5 rounded-2xl border border-stone-200 dark:border-white/5 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-purple-500/50 transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                selectedProject
                  ? "Ask Nexus a question..."
                  : "Select a project first..."
              }
              disabled={isLoading || !selectedProject}
              className="flex-1 min-w-0 pr-12 py-3.5 bg-transparent text-sm text-stone-800 dark:text-slate-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder-stone-400 dark:placeholder-slate-500 pl-2"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || !selectedProject}
              className="absolute right-2.5 p-1.5 rounded-lg text-white bg-purple-600 hover:bg-purple-700 disabled:bg-stone-200 dark:disabled:bg-white/5 disabled:text-stone-400 dark:disabled:text-slate-600 transition-all disabled:cursor-not-allowed shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
          </form>
          <div className="text-center">
            <span className="text-[10px] text-stone-400 dark:text-slate-500 font-medium tracking-wide flex items-center justify-center gap-1.5">
              Nexus AI can make mistakes. Verify important information.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
