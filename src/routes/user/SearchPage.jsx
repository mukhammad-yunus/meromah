import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import NotFound from "../../components/NotFound";
import SearchPagePosts from "./components/Search/SearchPagePosts";
import SearchPageBoards from "./components/Search/SearchPageBoards";
import SearchPageDescs from "./components/Search/SearchPageDescs";
import SearchPageTests from "./components/Search/SearchPageTests";

const SearchPage = () => {
  const [activeTab, setActiveTab] = useState("Posts");
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => searchParams.get("query"), []);
  if (query === null) return <NotFound />;

  return (
    <div className="min-h-screen bg-primary-bg dark:bg-neutral-950">
      <div>
        {/* Header */}

        {/* Post */}
        {activeTab === "Posts" ? (
          <SearchPagePosts
            key={"Posts"}
            onSelectTab={(tab) => setActiveTab(tab)}
            activeTab={activeTab}
            query={query}
          />
        ) : null}
        {/* Test */}
        {activeTab === "Tests" ? (
          <SearchPageTests
            key={"Tests"}
            onSelectTab={(tab) => setActiveTab(tab)}
            activeTab={activeTab}
            query={query}
          />
        ) : null}
        {/* Boards */}
        {activeTab === "Boards" ? (
          <SearchPageBoards
            key={"Boards"}
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            query={query}
          />
        ) : null}
        {activeTab === "Descs" ? (
          <SearchPageDescs
            key={"Descs"}
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            query={query}
          />
        ) : null}
      </div>
    </div>
  );
};

export default SearchPage;
