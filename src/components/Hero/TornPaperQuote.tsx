import React from "react";
import styles from "./Hero.module.css";
import { QuoteConfig } from "@/config/site";

interface TornPaperQuoteProps {
  quote: QuoteConfig;
  author?: string;
}

export const TornPaperQuote: React.FC<TornPaperQuoteProps> = ({ quote, author }) => {
  const parts = quote.text.split(quote.highlight);
  const trimmedAuthor = author?.trim() ?? "";
  const formattedAuthor = trimmedAuthor
    ? trimmedAuthor.startsWith("—")
      ? trimmedAuthor
      : `— ${trimmedAuthor}`
    : "";

  return (
    <figure className={styles.tornQuoteWrapper}>
      <blockquote className={styles.tornQuoteCard}>
        <span className={styles.quoteMark} aria-hidden="true">“</span>
        <p className={styles.quoteText}>
          {parts[0]}
          <mark className={styles.highlighter}>{quote.highlight}</mark>
          {parts[1] || ""}
        </p>
        {formattedAuthor && (
          <figcaption className={styles.quoteAuthor}>{formattedAuthor}</figcaption>
        )}
        <span className={styles.quotePin} aria-hidden="true" />
      </blockquote>
    </figure>
  );
};
