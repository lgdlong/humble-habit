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
    <div className="fixed bottom-0 left-0 right-0 text-center px-4 py-4 bg-background/95 backdrop-blur-sm border-t">
      <p className="italic text-sm text-muted-foreground">
        &ldquo;{quote.text}&rdquo;
      </p>
      <p className="text-xs text-muted-foreground mt-1">({quote.author})</p>
    </div>
  );
}
