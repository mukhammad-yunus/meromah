"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import MarkdownViewer from "../../src/components/markdownViewer/MarkdownViewer.jsx";
import { FAQ_ITEMS } from "../../src/routes/main/faqData.js";

const CategoryPill = ({ active, label, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? "bg-primary-blue text-white border-primary-blue"
          : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
      }`}
    >
      {label}
    </button>
  );
};

const FaqItem = ({ item, isOpen, onToggle }) => {
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        // Measure the actual height when opening
        setContentHeight(contentRef.current.scrollHeight);
      } else {
        // Reset height when closing
        setContentHeight(0);
      }
    }
  }, [isOpen, item]);

  // Update height when content changes (e.g., images loading)
  useEffect(() => {
    if (isOpen && contentRef.current) {
      const updateHeight = () => {
        if (contentRef.current) {
          setContentHeight(contentRef.current.scrollHeight);
        }
      };

      // Update height after images load
      const images = contentRef.current.querySelectorAll("img");
      let loadedCount = 0;
      const totalImages = images.length;

      if (totalImages === 0) {
        updateHeight();
      } else {
        images.forEach((img) => {
          if (img.complete) {
            loadedCount++;
            if (loadedCount === totalImages) updateHeight();
          } else {
            img.addEventListener("load", () => {
              loadedCount++;
              if (loadedCount === totalImages) updateHeight();
            });
            img.addEventListener("error", () => {
              loadedCount++;
              if (loadedCount === totalImages) updateHeight();
            });
          }
        });
      }

      // Also update on resize
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(contentRef.current);

      return () => {
        resizeObserver.disconnect();
        images.forEach((img) => {
          img.removeEventListener("load", updateHeight);
          img.removeEventListener("error", updateHeight);
        });
      };
    }
  }, [isOpen, item]);

  return (
    <div
      data-faq-item
      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100 leading-6">
              {item.question}
            </h3>
            {item.isTutorial ? (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-blue/10 text-primary-blue dark:bg-blue-400/10 dark:text-blue-300 border border-primary-blue/20 dark:border-blue-400/20">
                Tutorial
              </span>
            ) : null}
          </div>
          {item.shortAnswer ? (
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2">
              {item.shortAnswer}
            </p>
          ) : null}
        </div>
        <ChevronDown
          className={`w-5 h-5 mt-0.5 text-neutral-500 dark:text-neutral-400 transition-transform duration-300 ease-in-out ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: `${contentHeight}px`,
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div ref={contentRef} className="px-5 pb-5">
          {item.answer ? (
            <div className="text-sm text-neutral-700 dark:text-neutral-300 leading-6 pt-1">
              <MarkdownViewer>{item.answer}</MarkdownViewer>
            </div>
          ) : null}

          {item.isTutorial && item.tutorial ? (
            <div className="mt-4">
              <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                Steps
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
                <MarkdownViewer>{item.tutorial}</MarkdownViewer>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const FaqSearch = () => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openId, setOpenId] = useState(null);
  const containerRef = useRef(null);

  const categories = useMemo(() => {
    const set = new Set(["All"]);
    for (const item of FAQ_ITEMS) {
      if (item.category) set.add(item.category);
    }
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      if (!matchesCategory) return false;

      if (!q) return true;
      const haystack = [
        item.question,
        item.answer,
        item.shortAnswer,
        item.tutorial,
        item.category,
      ]
        .filter(Boolean)
        .join("\n")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, activeCategory]);

  // Handle scroll position when opening/closing sections
  const handleToggle = (itemId) => {
    const wasOpen = openId === itemId;
    const previousOpenId = openId;

    // Store scroll position and clicked element position before state change
    const scrollYBefore = window.scrollY;
    const clickedIndex = filtered.findIndex((item) => item.id === itemId);
    let clickedItemTopBefore = 0;

    if (clickedIndex >= 0 && containerRef.current) {
      const items = containerRef.current.querySelectorAll("[data-faq-item]");
      if (items[clickedIndex]) {
        clickedItemTopBefore =
          items[clickedIndex].getBoundingClientRect().top + scrollYBefore;
      }
    }

    // Update state
    setOpenId((prev) => (prev === itemId ? null : itemId));

    // Handle scroll adjustment when switching between sections
    if (!wasOpen && previousOpenId && clickedIndex >= 0) {
      // Wait for DOM to update after state change
      setTimeout(() => {
        if (containerRef.current) {
          const items = containerRef.current.querySelectorAll("[data-faq-item]");
          if (items[clickedIndex]) {
            const clickedItemTopAfter =
              items[clickedIndex].getBoundingClientRect().top + window.scrollY;
            const heightDiff = clickedItemTopAfter - clickedItemTopBefore;
            // Adjust scroll to maintain relative position
            window.scrollTo({
              top: scrollYBefore + heightDiff,
              behavior: "smooth",
            });
          }
        }
      }, 50);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-4 sm:p-5 mb-6">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 dark:text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions…"
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-4 focus:ring-primary-blue/15"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <CategoryPill
                key={c}
                label={c}
                active={activeCategory === c}
                onClick={() => setActiveCategory(c)}
              />
            ))}
          </div>
        </div>
      </div>

      <div ref={containerRef} className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 text-center">
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              No results. Try a different search.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <FaqItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => handleToggle(item.id)}
            />
          ))
        )}
      </div>
    </>
  );
};

export default FaqSearch;
