import React from "react";
import PostCard from "../PostCard";
import { Edit } from "lucide-react";
import { DEFAULT_PLACEHOLDERS } from "../../../../utils";
import Loading from "../../../../components/Loading";

const ProfilePosts = ({ isPostsLoading, posts, isPostsSuccess }) => {
  if (isPostsLoading) return <Loading />;

  if (isPostsSuccess && posts?.data?.length > 0) {
    return (
      <>
        {posts.data.map((post, index) => (
          <PostCard
            key={post.id}
            item={post}
            isFirst={index === 0}
            isLast={index === posts.data.length - 1}
            itemType={"post"}
            communityType="board"
            communityUrl="b/"
          />
        ))}
      </>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg p-8 text-center shadow-sm">
      <Edit className="mx-auto text-4xl text-neutral-400 dark:text-neutral-500 mb-4" />
      <p className="text-neutral-600 dark:text-neutral-400">{DEFAULT_PLACEHOLDERS.noPosts}</p>
    </div>
  );
};

export default ProfilePosts;
