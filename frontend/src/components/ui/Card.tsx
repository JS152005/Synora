import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

function Card({
  children,
  title,
  subtitle,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-xl
        border
        border-gray-200
        bg-white
        shadow-sm
        ${className}
      `}
      {...props}
    >
      {(title || subtitle) && (
        <div className="border-b border-gray-200 px-6 py-4">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

export default Card;
