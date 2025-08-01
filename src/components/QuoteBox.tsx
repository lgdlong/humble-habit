"use client";

import { useEffect, useState } from "react";
import { getRandomQuote } from "@/lib/quotes";

export function QuoteBox() {
  const [quote, setQuote] = useState({ text: "", author: "" });

  useEffect(() => {
    const randomQuote = getRandomQuote();
    setQuote(randomQuote);
  }, []);

  if (!quote.text) return null;

  return (
    <div className="text-center px-4 py-6">
      <p className="italic text-sm text-muted-foreground">
        &ldquo;{quote.text}&rdquo;
      </p>
      <p className="text-xs text-muted-foreground mt-2">({quote.author})</p>
    </div>
  );
}
