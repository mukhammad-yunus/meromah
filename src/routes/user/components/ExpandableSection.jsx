import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
const MAX_ITEMS_NUM = 5
const ExpandableSection = ({
  section={items:[]},
  isExpanded,
  toggleSection,
  closeMobileMenu,
}) => {
  const navigate = useNavigate();
  const Icon = section.icon;
  const items = useMemo(() => section.items.slice(0, MAX_ITEMS_NUM), [section])

  const onViewAllClick = ()=>{
    closeMobileMenu()
    const url = `${section.id[0]}/all?sort=subscribed`
    navigate(url)
  }
  return (
    <div>
      <button
        onClick={() => toggleSection(section.id)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all cursor-pointer"
      >
        {Icon && <Icon className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />}
        <span className="flex-1 text-left">{section.title}</span>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 dark:text-neutral-500 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`transition-all duration-200 ease-out ${
          isExpanded ? "max-h-96 opacity-100 mt-0.5" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="space-y-0.5 pl-1">
          {items?.length > 0 ? (
            items?.map((item, i) => (
              <Link
                //Here, temporary key value inserted, later it will be removed or altered
                key={`${item.name} + ${i} + ${item.id}`}
                to={section.id === "resources" ? item.path : section.path + "/" + item.name}
                onClick={() => {
                  closeMobileMenu();
                  toggleSection(section.id);
                }}
                className="w-full flex text-left px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 dark:text-neutral-100 rounded-md transition-all"
              >
                <span className="truncate">{item.name}</span>
              </Link>
            ))
          ) : (
            <p className="text-neutral-500 dark:text-neutral-400 text-xs py-1">
              No {section.id} exists.
            </p>
          )}

          {section.id !== "recent" && section.id !== "resources" && section.items.length > 5 && (
            <button
              onClick={()=> onViewAllClick()}
              className="w-full text-left px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md dark:hover:bg-neutral-700 dark:hover:text-blue-100 dark:text-blue-400  transition-all"
            >
              View all
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpandableSection;
