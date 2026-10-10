import type { ReactNode } from "react";

export interface ListProps {
  children: ReactNode;
  divided?: boolean;
  spacing?: "sm" | "md" | "lg";
  className?: string;
}

export function List({
  children,
  divided = true,
  spacing = "md",
  className = "",
}: ListProps) {
  const spacingClasses = {
    sm: "space-y-1",
    md: "space-y-2",
    lg: "space-y-3",
  };

  return (
    <ul
      role="list"
      className={`
        ${spacingClasses[spacing]}
        ${divided ? "divide-y divide-slate-100" : ""}
        ${className}
      `.trim().replace(/\s+/g, " ")}
    >
      {children}
    </ul>
  );
}

export interface ListItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  interactive?: boolean;
}

export function ListItem({
  children,
  onClick,
  className = "",
  interactive = false,
}: ListItemProps) {
  const isClickable = !!onClick || interactive;

  return (
    <li
      onClick={onClick}
      className={`
        flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0 transition-colors
        ${isClickable ? "hover:bg-slate-50/80 cursor-pointer rounded-xl px-2.5 -mx-2.5" : ""}
        ${className}
      `.trim().replace(/\s+/g, " ")}
    >
      {children}
    </li>
  );
}

export default List;
