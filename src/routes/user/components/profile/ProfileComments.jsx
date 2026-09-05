import React from 'react'
import Loading from '../../../../components/Loading';
import CommentCard from '../CommentCard';
import { MessageCircle } from 'lucide-react';
import { DEFAULT_PLACEHOLDERS } from '../../../../utils';

const ProfileComments = ({ isLoading, comments }) => {
  if (isLoading) return <Loading />;

  if (comments?.length > 0) {
    return (
      <div>
        {comments.map((comment, i) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            isFirst={i === 0}
            isLast={i === comments.length - 1}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-8 text-center shadow-sm dark:bg-neutral-800">
      <MessageCircle className="mx-auto text-4xl text-neutral-400 mb-4" />
      <p className="text-neutral-600 dark:text-neutral-400">{DEFAULT_PLACEHOLDERS.noComments}</p>
    </div>
  );
}

export default ProfileComments