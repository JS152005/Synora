import Input from "../ui/Input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({
  value,
  onChange,
}: SearchBarProps) => {
  return (
    <Input
      placeholder="Search students..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default SearchBar;
