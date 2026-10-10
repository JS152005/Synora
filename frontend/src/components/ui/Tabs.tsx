import type { ReactNode } from "react";

export interface TabItem<T extends string = string> {
  key: T;
  label: string;
  count?: number;
  icon?: ReactNode;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  variant?: "underline" | "pills";
  className?: string;
}

function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  variant = "underline",
  className = "",
}: TabsProps<T>) {
  if (variant === "pills") {
    return (
      <div
        className={`flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl ${className}`}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.key)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                transition-all duration-150 cursor-pointer select-none
                ${
                  isActive
                    ? "bg-white text-indigo-700 font-semibold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }
              `.trim().replace(/\s+/g, " ")}
            >
              {tab.icon && (
                <span className="shrink-0 h-3.5 w-3.5">{tab.icon}</span>
              )}
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`
                    rounded-full px-1.5 py-0.2 text-[10px] font-semibold
                    ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "bg-slate-200/80 text-slate-600"
                    }
                  `.trim().replace(/\s+/g, " ")}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-0 border-b border-slate-200/80 overflow-x-auto ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`
              relative flex items-center gap-1.5 px-4 py-3 text-xs font-medium
              transition-colors duration-150 cursor-pointer select-none whitespace-nowrap
              focus-visible:outline-none
              ${
                isActive
                  ? "text-indigo-600 font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }
            `.trim().replace(/\s+/g, " ")}
          >
            {tab.icon && (
              <span className="shrink-0 h-3.5 w-3.5" aria-hidden="true">
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`
                  rounded-full px-1.5 py-0.5 text-[10px] font-semibold
                  ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-100 text-slate-600"
                  }
                `.trim().replace(/\s+/g, " ")}
              >
                {tab.count}
              </span>
            )}

            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
