import { Search, X } from "lucide-react";
import Input from "../ui/Input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search students by name, keywords...",
}: SearchBarProps) => {
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      icon={<Search className="h-4 w-4" />}
      rightElement={
        value ? (
          <button
            onClick={() => onChange("")}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null
      }
    />
  );
};

export default SearchBar;
