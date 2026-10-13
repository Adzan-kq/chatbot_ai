"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const nextId = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function addMessage(message: Omit<Message, "id">) {
    setMessages((prev) => [...prev, { ...message, id: nextId.current++ }]);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    addMessage({ role: "user", content: trimmed });
    setQuestion("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      addMessage({ role: "assistant", content: data.answer });
    } catch (err) {
      addMessage({
        role: "assistant",
        content: err instanceof Error ? err.message : "Something went wrong",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-6 font-sans dark:bg-black">
      <div className="flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm dark:border-white/15 dark:bg-zinc-900">
        <header className="border-b border-black/8 px-5 py-4 dark:border-white/15">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Chatbot
          </h1>
        </header>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
          {messages.length === 0 && !loading && (
            <p className="m-auto text-zinc-500 dark:text-zinc-400">
              Ask a question to start the conversation.
            </p>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 ${
                  m.role === "user"
                    ? "rounded-br-sm bg-foreground text-background"
                    : m.error
                      ? "rounded-bl-sm bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                      : "rounded-bl-sm bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-zinc-100 px-4 py-2 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                Thinking...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex gap-3 border-t border-black/8 px-5 py-4 dark:border-white/15"
        >
          <label htmlFor="question" className="sr-only">
            Question
          </label>
          <input
            id="question"
            name="question"
            type="text"
            autoComplete="off"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question..."
            className="h-11 flex-1 rounded-lg border border-black/12 bg-transparent px-3 text-zinc-900 outline-none focus:border-zinc-900 dark:border-white/20 dark:text-zinc-50 dark:focus:border-zinc-50"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="h-11 rounded-lg bg-foreground px-5 font-medium text-background transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
