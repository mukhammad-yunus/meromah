import PostImages from "./PostImages";
import PostFiles from "./PostFiles";
import { useNavigate } from "react-router-dom";
import MarkdownViewer from "../../../components/markdownViewer/MarkdownViewer";
import { FileQuestion, Clock, Play, CheckCircle2 } from "lucide-react";

const PostContent = ({ item, itemType, images, files }) => {
  const navigate = useNavigate();
  const onStartTest = (e) => {
    e.stopPropagation();
    navigate(`/d/${item.data.desc.name}/tests/${item.data.id}/start`);
  };
  return (
    <section>
      {itemType === "test" ? (
        <div className="flex flex-col gap-2">
          <div>
            <h4 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              {item.data.title}
            </h4>
            <div className="mb-4">
              <MarkdownViewer>{item.data.description}</MarkdownViewer>
            </div>
            <div className="flex flex-wrap gap-3 mb-4 text-sm text-neutral-500 dark:text-neutral-400">
              {item.data.questions_count !== undefined && (
                <div className="flex items-center gap-1">
                  <FileQuestion className="w-4 h-4" />
                  <span>{item.data.questions_count} questions</span>
                  <CheckCircle2 className="w-4 h-4"/>
                  <span>{item.data.submissions_count} submissions</span>
                </div>
              )}
              {item.data.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{item.data.duration} min</span>
                </div>
              )}
            </div>
            <button
              className="rounded bg-primary-blue text-white text-sm hover:bg-primary-blue/90 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:bg-neutral-100 dark:text-neutral-900 font-medium cursor-pointer dark:hover:bg-neutral-900 dark:hover:text-neutral-100 px-6 py-2 flex items-center justify-center gap-2 w-full sm:w-fit sm:float-end"
              onClick={onStartTest}
            >
              <Play className="w-4 h-4" />
              Start Test
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 pb-3 border-b border-neutral-200 dark:border-neutral-700">
            {item.data.title}
          </h2>
          <MarkdownViewer>
            {item.data.body}
          </MarkdownViewer>
          {/* Display images if available */}
          {images.length > 0 && <PostImages images={images} />}
          {/* Display files if available */}
          {files.length > 0 && <PostFiles files={files} />}
        </div>
      )}
    </section>
  );
};

export default PostContent;
