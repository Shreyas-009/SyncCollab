import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendChatMessage } from '../utils/api';

const ChatInterface = ({ isOpen, onClose, selectedProject }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Reset messages when project changes
    useEffect(() => {
        setMessages([
            { role: 'ai', content: `Hello! I'm your AI assistant for ${selectedProject?.name || 'this project'}. I know about the last 30 days of activity here. What would you like to know?` }
        ]);
    }, [selectedProject]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedProject || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const responseText = await sendChatMessage(selectedProject._id, userMessage);
            setMessages(prev => [...prev, { role: 'ai', content: responseText }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'error', content: 'Sorry, I encountered an error fetching the response.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] md:w-[600px] bg-white dark:bg-slate-800 shadow-2xl flex flex-col z-50 border-l border-stone-200 dark:border-slate-700 transition-transform duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h2 className="font-semibold text-stone-800 dark:text-slate-100">Project AI</h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-stone-200 dark:hover:bg-slate-700 rounded-full text-stone-500 dark:text-slate-400 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50 dark:bg-slate-800/50">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex flex-col w-full ${msg.role === 'user' ? 'ml-auto items-end max-w-[85%]' : 'mr-auto items-start max-w-full'}`}
                    >
                        <span className="text-[10px] text-stone-400 dark:text-slate-500 mb-1 px-1 uppercase tracking-wider font-semibold">
                            {msg.role === 'error' ? 'System' : msg.role === 'user' ? 'You' : 'AI'}
                        </span>
                        <div
                            className={`px-4 py-3 rounded-2xl text-sm shadow-sm max-w-full overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 ${
                                msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                                    : msg.role === 'error'
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-tl-sm border border-red-200 dark:border-red-800'
                                        : 'bg-white dark:bg-slate-700 text-stone-800 dark:text-slate-200 rounded-tl-sm border border-stone-200 dark:border-slate-600'
                            }`}
                        >
                            {msg.role === 'user' ? (
                                <p className="whitespace-pre-wrap">{typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}</p>
                            ) : (
                                <div className="text-sm dark:text-slate-200 leading-relaxed overflow-x-hidden">
                                    <ReactMarkdown 
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            table: ({node, ...props}) => (
                                                <div className="w-full overflow-x-auto my-3 pb-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600">
                                                    <div className="min-w-[600px] border border-stone-200 dark:border-slate-600 rounded-lg overflow-hidden">
                                                        <table className="w-full text-left border-collapse text-[13px] sm:text-sm bg-white dark:bg-slate-800" {...props} />
                                                    </div>
                                                </div>
                                            ),
                                            thead: ({node, ...props}) => <thead className="bg-stone-100 dark:bg-slate-700 text-stone-700 dark:text-slate-200" {...props} />,
                                            th: ({node, ...props}) => <th className="p-3 font-semibold border-b border-stone-200 dark:border-slate-600 whitespace-nowrap min-w-[100px]" {...props} />,
                                            td: ({node, ...props}) => <td className="p-3 border-b border-stone-200 dark:border-slate-600 last:border-0 align-top break-words max-w-[250px]" style={{wordBreak: 'break-word'}} {...props} />,
                                            tbody: ({node, ...props}) => <tbody className="divide-y divide-stone-200 dark:divide-slate-600" {...props} />,
                                            p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                                            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                                            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                                            li: ({node, ...props}) => <li className="" {...props} />,
                                            strong: ({node, ...props}) => <strong className="font-semibold text-indigo-700 dark:text-indigo-300" {...props} />,
                                            code: ({node, inline, ...props}) => inline ? 
                                                <code className="bg-stone-100 dark:bg-slate-900 px-1 py-0.5 rounded text-[13px] text-pink-600 dark:text-pink-400 font-mono" {...props} /> :
                                                <div className="bg-stone-100 dark:bg-slate-900 p-3 rounded-lg overflow-x-auto mb-3 border border-stone-200 dark:border-slate-700 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600"><code className="text-[13px] font-mono" {...props} /></div>
                                        }}
                                    >
                                        {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content, null, 2)}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex flex-col mr-auto items-start max-w-[85%]">
                        <span className="text-[10px] text-stone-400 dark:text-slate-500 mb-1 px-1 uppercase tracking-wider font-semibold">AI</span>
                        <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-700 border border-stone-200 dark:border-slate-600 shadow-sm flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-stone-200 dark:border-slate-700">
                <form onSubmit={handleSend} className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={selectedProject ? "Ask about project activity..." : "Select a project first..."}
                        disabled={isLoading || !selectedProject}
                        className="w-full pl-4 pr-12 py-3 rounded-xl border border-stone-300 dark:border-slate-600 bg-stone-50 dark:bg-slate-700 text-stone-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading || !selectedProject}
                        className="absolute right-2 p-1.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-stone-300 dark:disabled:bg-slate-600 transition-colors disabled:cursor-not-allowed shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;
