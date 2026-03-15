import React, { useEffect, useMemo, useRef } from 'react';
import { Sun, Moon, Menu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { jsPDF } from 'jspdf';
import { useTheme } from '../../context/useTheme';

const PROMPTS = [
    { text: 'Provide structured report', icon: 'bi-file-earmark-text', type: 'report' },
    { text: 'Summarize pending tasks', icon: 'bi-list-check', type: 'summary' },
    { text: 'What are the recent updates?', icon: 'bi-clock-history', type: 'updates' },
    { text: 'Identify any blockers', icon: 'bi-exclamation-triangle', type: 'blockers' },
];

const PREVIEW_MESSAGES = [
    { role: 'user', content: 'Provide structured report' },
    { role: 'ai', content: `**Weekly Project Report: SyncCollab V2**\n\nHere is a detailed summary of recent project activities and progress.\n\n### Task Progress Summary\n\n| Phase | Total Tasks | Completed | In Progress | Pending |\n|---|---|---|---|---|\n| Design | 12 | 12 | 0 | 0 |\n| Frontend | 24 | 18 | 4 | 2 |\n| Backend | 15 | 10 | 5 | 0 |\n| Testing | 8 | 2 | 2 | 4 |\n\n### Critical Blockers detected:\n- **API Rate Limiting**: The external LLM API is hitting rate limits during peak usage. Need to implement robust caching strategy.\n\n### Next Steps:\n1. Resolve mobile navigation bug on deeply nested routes.\n2. Finalize pricing tier database models.\n3. Prepare for staging deployment on Friday.\n\nNexus AI can also generate PDF reports instantly. Click the export button below to try it.`, allowPDF: true }
];

const NexusPreview = () => {
    const { isDark } = useTheme();

    const mdComponents = useMemo(() => ({
        table: ({ node, ...props }) => (
            <div className="w-full my-3" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain' }}>
                <div className="min-w-[580px] border border-stone-200 dark:border-slate-600 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-[13px] bg-white dark:bg-slate-800" {...props} />
                </div>
            </div>
        ),
        thead: ({ node, ...props }) => <thead className="bg-stone-50 dark:bg-slate-700/80 text-stone-700 dark:text-slate-200" {...props} />,
        th: ({ node, ...props }) => <th className="px-3 py-2.5 font-semibold border-b border-stone-200 dark:border-slate-600 whitespace-nowrap text-xs uppercase tracking-wider" {...props} />,
        td: ({ node, children, ...props }) => {
            const text = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : '';
            const dateTimeMatch = text.match(/^([A-Za-z]+ \d+),\s+(\d+:\d+ [AP]M)$/);
            return (
                <td className="px-3 py-2.5 border-b border-stone-100 dark:border-slate-700 last:border-0 align-top" style={{ wordBreak: 'break-word', maxWidth: '200px' }} {...props}>
                    {dateTimeMatch ? (
                        <span className="text-xs">
                            <span className="block font-medium text-stone-700 dark:text-slate-300">{dateTimeMatch[1]}</span>
                            <span className="block text-stone-400 dark:text-slate-500">{dateTimeMatch[2]}</span>
                        </span>
                    ) : children}
                </td>
            );
        },
        tbody: ({ node, ...props }) => <tbody className="divide-y divide-stone-100 dark:divide-slate-700" {...props} />,
        tr: ({ node, ...props }) => <tr className="hover:bg-stone-50 dark:hover:bg-slate-700/30 transition-colors" {...props} />,
        p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
        li: ({ node, ...props }) => <li className="" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-semibold text-indigo-700 dark:text-indigo-300" {...props} />,
        code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !match
                ? <code className={`bg-stone-100 dark:bg-slate-900 px-1 py-0.5 rounded text-[13px] text-pink-600 dark:text-pink-400 font-mono ${className || ''}`} {...props}>{children}</code>
                : <div className="bg-stone-100 dark:bg-slate-900 p-3 rounded-lg overflow-x-auto mb-3 border border-stone-200 dark:border-slate-700"><code className={`text-[13px] font-mono ${className || ''}`} {...props}>{children}</code></div>;
        },
        h2: ({ node, ...props }) => <h2 className="text-base font-bold text-stone-800 dark:text-slate-100 mt-4 mb-2" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-sm font-semibold text-stone-700 dark:text-slate-300 mt-3 mb-1.5" {...props} />,
    }), []);

    const generateTextPDF = (text, title) => {
        try {
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageWidth = 210, margin = 15, contentWidth = pageWidth - margin * 2;
            let y = 15;
            const checkPageBreak = (needed = 7) => { if (y + needed > 285) { pdf.addPage(); y = 15; } };
            pdf.setFontSize(18); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(30, 30, 30);
            pdf.text('Nexus Report', margin, y); y += 10;
            const raw = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
            const lines = raw.replace(/`/g, "'").split('\n');
            let i = 0;
            while (i < lines.length) {
                const line = lines[i];
                if (line.startsWith('## ')) {
                    checkPageBreak(10); pdf.setFontSize(13); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(55, 65, 200);
                    pdf.text(line.replace(/^##\s*/, ''), margin, y); y += 7; pdf.setTextColor(30, 30, 30); i++;
                } else if (line.startsWith('### ')) {
                    checkPageBreak(9); pdf.setFontSize(11); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(80, 80, 80);
                    pdf.text(line.replace(/^###\s*/, ''), margin, y); y += 6; pdf.setTextColor(30, 30, 30); i++;
                } else if (line.startsWith('|')) {
                    const tableLines = [];
                    while (i < lines.length && lines[i].startsWith('|')) { tableLines.push(lines[i]); i++; }
                    const parseRow = (r) => r.split('|').map(c => c.trim()).filter(Boolean);
                    const header = parseRow(tableLines[0]);
                    const dataRows = tableLines.slice(2).map(parseRow);
                    if (header.length > 0) {
                        checkPageBreak(15);
                        const numCols = header.length;
                        let colWidths = numCols === 4 ? [35, 35, 30, contentWidth - 100] : Array(numCols).fill(contentWidth / numCols);
                        pdf.setFillColor(235, 237, 250); pdf.rect(margin, y - 4, contentWidth, 8, 'F');
                        pdf.setFontSize(9); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(30, 30, 100);
                        let xOff = margin;
                        header.forEach((h, ci) => { pdf.text(h, xOff + 1, y); xOff += colWidths[ci]; });
                        y += 7; pdf.setFont('helvetica', 'normal'); pdf.setTextColor(30, 30, 30);
                        dataRows.forEach((row) => {
                            const cleanRow = row.map(c => c.replace(/\*\*/g, '').replace(/(?<![*])\*(?![*])/g, '').trim());
                            let maxWraps = 1;
                            cleanRow.forEach((cell, ci) => { const w = pdf.splitTextToSize(cell, (colWidths[ci] || 30) - 3); if (w.length > maxWraps) maxWraps = w.length; });
                            const rowH = maxWraps * 5 + 4;
                            checkPageBreak(rowH + 1); xOff = margin;
                            cleanRow.forEach((cell, ci) => { const w = pdf.splitTextToSize(cell, (colWidths[ci] || 30) - 3); pdf.text(w, xOff + 1.5, y); xOff += colWidths[ci] || 30; });
                            y += rowH;
                            pdf.setDrawColor(210, 215, 235); pdf.line(margin, y - 6.5, margin + contentWidth, y - 6.5);
                        }); y += 2;
                    }
                } else if (line.trim() === '*' || line.trim() === '') { y += line.trim() ? 0 : 2; i++;
                } else if (line.startsWith('• ') || line.startsWith('- ') || line.match(/^\*\s/)) {
                    checkPageBreak(7); pdf.setFontSize(10); pdf.setFont('helvetica', 'normal');
                    const cleanBullet = line.replace(/^[•\-\*]\s*/, '').replace(/\*\*/g, '');
                    const wrapped = pdf.splitTextToSize(`• ${cleanBullet}`, contentWidth - 4);
                    pdf.setTextColor(30, 30, 30); pdf.text(wrapped, margin + 3, y); y += wrapped.length * 5 + 1; i++;
                } else if (line.match(/^[-_]{3,}/)) {
                    checkPageBreak(4); pdf.setDrawColor(200, 200, 200); pdf.line(margin, y, margin + contentWidth, y); y += 4; i++;
                } else if (line.trim()) {
                    checkPageBreak(7); pdf.setFontSize(10); pdf.setTextColor(30, 30, 30);
                    const segments = line.split(/\*\*/);
                    let xCursor = margin;
                    segments.forEach((seg, si) => {
                        const isBold = si % 2 === 1;
                        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
                        const wrapped = pdf.splitTextToSize(seg, contentWidth);
                        pdf.text(wrapped, xCursor, y); xCursor = margin; y += wrapped.length * 5;
                    }); y += 1; i++;
                } else { y += 3; i++; }
            }
            pdf.save(`${title || 'SyncCollab_Nexus_Report'}.pdf`);
        } catch (error) { console.error('Failed to generate PDF', error); }
    };


    const scrollContainerRef = useRef(null);

    useEffect(() => {
        // Direct scroll on the internal container so it doesn't affect the whole page
        const timer = setTimeout(() => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
            }
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#fafafa] dark:bg-[#0c0c0e]">
            {/* Page Header */}
            <div className="shrink-0 h-[72px] flex items-center justify-between px-4 md:px-6 border-b border-stone-200/50 dark:border-white/5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button
                        disabled
                        className="md:hidden p-2 -ml-2 rounded-xl text-stone-600 dark:text-slate-300 opacity-50 cursor-not-allowed"
                        title="Menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <svg className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-stone-800 dark:text-slate-100 leading-tight text-base">Nexus</h2>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white">AI</span>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-slate-400">Project activity analyst</p>
                    </div>
                </div>
                <button
                    disabled
                    className="w-10 h-10 flex items-center justify-center rounded-xl opacity-50 cursor-not-allowed text-stone-500 dark:text-amber-400"
                    title="Toggle theme"
                >
                    {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>

            {/* Messages area */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar pt-6">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
                    {PREVIEW_MESSAGES.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex flex-col w-full ${msg.role === 'user' ? 'ml-auto items-end max-w-[85%]' : 'mr-auto items-start max-w-full'}`}
                        >
                            <span className="text-[10px] text-stone-400 dark:text-slate-500 mb-1 px-1 uppercase tracking-wider font-semibold">
                                {msg.role === 'error' ? 'System' : msg.role === 'user' ? 'You' : 'Nexus'}
                            </span>
                            <div className={`px-4 py-3.5 rounded-2xl text-[14.5px] shadow-sm max-w-full ${
                                msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-sm shadow-indigo-500/20'
                                    : msg.role === 'error'
                                        ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-tl-sm border border-red-100 dark:border-red-900/50'
                                        : 'bg-white dark:bg-slate-800/80 text-stone-800 dark:text-slate-200 rounded-tl-sm border border-stone-200/50 dark:border-white/5 backdrop-blur-sm overflow-x-visible'
                            }`}>
                                {msg.role === 'user' ? (
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                ) : (
                                    <div className="text-sm dark:text-slate-200 leading-relaxed">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                                            {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content, null, 2)}
                                        </ReactMarkdown>
                                        {msg.role === 'ai' && msg.allowPDF && (
                                            <div className="mt-3 pt-3 border-t border-stone-200/50 dark:border-white/10 flex justify-end">
                                                <button
                                                    onClick={() => generateTextPDF(msg.content, 'SyncCollab_Nexus_Report')}
                                                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    Export as PDF
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div className="h-4" />
                </div>
            </div>

            {/* Input area — heavily disabled for preview */}
            <div className="shrink-0 border-t border-stone-200/50 dark:border-white/5 bg-[#fafafa] dark:bg-[#0c0c0e] px-4 sm:px-6 py-4 opacity-60">
                <div className="max-w-2xl mx-auto flex flex-col gap-3">
                    {/* Prompt suggestion chips */}
                    <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar w-full pointer-events-none">
                        {PROMPTS.map((p) => (
                            <button
                                key={p.type}
                                disabled
                                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-100 dark:bg-slate-800/70 border border-stone-200 dark:border-slate-700 text-stone-500 dark:text-slate-400 flex-shrink-0 whitespace-nowrap cursor-not-allowed`}
                            >
                                <i className={`bi ${p.icon} text-stone-400 dark:text-slate-500 text-sm shrink-0`} />
                                <span>{p.text}</span>
                            </button>
                        ))}
                    </div>

                    {/* Text input */}
                    <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center bg-stone-100 dark:bg-slate-900/50 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm overflow-hidden cursor-not-allowed pointer-events-none">
                        <input
                            type="text"
                            value=""
                            readOnly
                            placeholder="Preview Mode: Chat inputs disabled..."
                            className="flex-1 min-w-0 pl-4 pr-12 py-3.5 bg-transparent text-sm text-stone-400 focus:outline-none cursor-not-allowed"
                        />
                        <button
                            type="button"
                            disabled
                            className="absolute right-2.5 p-2 rounded-xl text-stone-400 bg-stone-200 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed shadow-none"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        </button>
                    </form>
                    <p className="text-center text-[10px] text-stone-400 dark:text-slate-500 font-medium tracking-wide">
                        Nexus AI can make mistakes. Verify important information.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NexusPreview;
