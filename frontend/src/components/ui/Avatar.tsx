interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

function Avatar({
  src,
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  const sizes = {
    sm: "h-10 w-10 text-sm",
    md: "h-14 w-14 text-lg",
    lg: "h-24 w-24 text-3xl",
    xl: "h-36 w-36 text-5xl",
  };

  const initials = name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`
          rounded-full
          object-cover
          border-2
          border-blue-500
          ${sizes[size]}
          ${className}
        `}
      />
    );
  }

  return (
    <div
      className={`
        flex
        items-center
        justify-center
        rounded-full
        bg-blue-600
        font-bold
        text-white
        select-none
        border-2
        border-blue-500
        ${sizes[size]}
        ${className}
      `}
    >
      {initials || "U"}
    </div>
  );
}

export default Avatar;
