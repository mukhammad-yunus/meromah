import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import RelativeTime from "../../../components/RelativeTime";
import { getInitials } from "../../../utils";
import PostMenu from "./PostMenu";

const getType = {
  post: ["b", "board"],
  quiz: ["d", "desc"],
  library: ["b", "board"],
};

const PostHeader = ({ postData, postType, onEdit, onDelete, onReport }) => {
  const navigate = useNavigate();

  const handleAuthorClick = (e, path) => {
    e.stopPropagation();
    navigate(path);
  };

  const handleBoardClick = (e, path) => {
    e.stopPropagation();
    navigate(path);
  };

  return (
    <div className="px-4 border-b border-gray-200">
      <div className="flex items-center justify-between gap-2 py-4">
        <div className="flex items-center gap-2">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-neutral-600 hover:text-neutral-900 transition-colors font-medium cursor-pointer"
          >
            <FiChevronLeft className="text-2xl" />
          </button>
          {/* Author */}
          <div className="flex items-center gap-3">
            <div
              className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-shadow cursor-pointer ring-2 ring-white"
              onClick={(e) =>
                handleAuthorClick(
                  e,
                  `/user/${postData.data.author.username}`
                )
              }
            >
              <p className="w-11 h-11 flex items-center justify-center rounded-full">
                {getInitials(postData.data.author.username)}
              </p>
            </div>
            <div>
              <p
                className="max-w-5/6 w-full text-primary-blue text-base cursor-pointer hover:underline truncate font-medium"
                role="button"
                tabIndex={0}
                onClick={(e) =>
                  handleBoardClick(
                    e,
                    `/${getType[postType][0]}/${postData.data.board.name}`
                  )
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  handleBoardClick(
                    e,
                    `/${getType[postType][0]}/${postData.data.board.name}`
                  )
                }
              >
                {getType[postType][0]}/{postData.data.board.name}
              </p>
              <p className="text-[12px] flex items-center gap-1">
                <span
                  onClick={(e) =>
                    handleAuthorClick(
                      e,
                      `/user/${postData.data.author.username}`
                    )
                  }
                  className="cursor-pointer hover:underline"
                  role="link"
                  tabIndex={0}
                >
                  u/{postData.data.author.username}
                </span>
                <RelativeTime
                  date={postData.data.created_at}
                  className="flex items-center text-gray-700 ml-1 "
                />
              </p>
            </div>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <PostMenu
            post={postData.data}
            onEdit={onEdit}
            onDelete={onDelete}
            onReport={onReport}
          />
        </div>
      </div>
    </div>
  );
};

export default PostHeader;

