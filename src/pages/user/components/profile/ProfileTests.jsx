import React from "react";
import Loading from "../../../../components/Loading";
import PostCard from "../PostCard";
import { FaQuestionCircle } from "react-icons/fa";
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
    <div className="bg-white rounded-lg p-8 text-center shadow-sm">
      <FaQuestionCircle className="mx-auto text-4xl text-neutral-400 mb-4" />
      <p className="text-neutral-600">{DEFAULT_PLACEHOLDERS.noQuizzes}</p>
    </div>
  );
};

export default ProfileTests;
