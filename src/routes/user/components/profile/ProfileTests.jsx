import React from "react";
import Loading from "../../../../components/Loading";
import PostCard from "../PostCard";
import { HelpCircle } from "lucide-react";
import { DEFAULT_PLACEHOLDERS } from "../../../../utils";

const ProfileTests = ({ isLoading, tests }) => {
  if (isLoading) return <Loading />;

  if (tests?.length > 0) {
    return (
      <div>
        {tests.map((quiz, i) => (
          <PostCard
            key={quiz.id}
            item={quiz}
            isFirst={i === 0}
            isLast={i === tests.length - 1}
            communityType="desc"
            communityUrl="d/"
            itemType="test"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg p-8 text-center shadow-sm">
      <HelpCircle className="mx-auto text-4xl text-neutral-400 dark:text-neutral-500 mb-4" />
      <p className="text-neutral-600 dark:text-neutral-400">{DEFAULT_PLACEHOLDERS.noQuizzes}</p>
    </div>
  );
};

export default ProfileTests;
