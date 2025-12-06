import React from 'react'
import { TabFilters } from '../../../../utils/tabFilters'
const tabFilters = new TabFilters().all()
const HomeHeader = ({onTabChange, tab }) => {
  return (
    <div className="grid grid-cols-2 bg-white border-b border-b-neutral-200">
        {tabFilters.map(({ value, label }) => (
          <div
            className="flex items-center group cursor-pointer hover:bg-neutral-100 transition-all duration-200 ease-in-out "
            onClick={() => onTabChange(value)}
            key={value}
          >
            <button
              className={`
                py-5 mx-auto font-semibold transition-all duration-150
                ${
                  tab === value
                    ? "border-b-4 text-neutral-950"
                    : "text-neutral-600 group-hover:text-neutral-900"
                }
                focus:outline-none cursor-pointer
              `}
              aria-label={`Filter by ${label}`}
              aria-pressed={tab === value}
            >
              <span>{label}</span>
            </button>
          </div>
        ))}
      </div>
  )
}

export default HomeHeader