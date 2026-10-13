"use client";

import { useState, type FormEvent } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      // TODO: replace with a real call to the chatbot backend.
      setResult(`You asked: "${trimmed}"`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12 font-sans dark:bg-black">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-zinc-900">
          <h1 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Ask a question
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="question" className="sr-only">
              Question
            </label>
            <input
              id="question"
              name="question"
              type="text"
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
              {loading ? "Sending..." : "Submit"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-zinc-900">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Result
          </h2>
          {result ? (
            <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{result}</p>
          ) : (
            <p className="text-zinc-500 dark:text-zinc-400">
              Your answer will appear here.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
