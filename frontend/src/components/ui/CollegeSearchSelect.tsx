import { useState, useRef, useEffect, useMemo } from "react";
import { Search, School, Check, X, ShieldCheck, ChevronDown, Building2, MapPin } from "lucide-react";
import type { College } from "../../types/user";

interface CollegeSearchSelectProps {
  colleges: College[];
  selectedCollegeId: string;
  onSelectCollege: (college: College | null) => void;
  isLoading?: boolean;
  error?: string;
  helperText?: string;
}

export function CollegeSearchSelect({
  colleges,
  selectedCollegeId,
  onSelectCollege,
  isLoading = false,
  error,
  helperText,
}: CollegeSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCollege = useMemo(
    () => colleges.find((c) => c.id === selectedCollegeId || c.code === selectedCollegeId) || null,
    [colleges, selectedCollegeId]
  );

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered colleges list
  const filteredColleges = useMemo(() => {
    if (!searchTerm.trim()) {
      return colleges.slice(0, 30); // show top 30 initially
    }
    const term = searchTerm.toLowerCase().trim();
    return colleges
      .filter((c) => {
        return (
          c.name.toLowerCase().includes(term) ||
          c.code.toLowerCase().includes(term) ||
          c.city.toLowerCase().includes(term) ||
          c.state.toLowerCase().includes(term) ||
          (c.officialName && c.officialName.toLowerCase().includes(term))
        );
      })
      .slice(0, 40);
  }, [colleges, searchTerm]);

  const handleSelect = (college: College) => {
    onSelectCollege(college);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectCollege(null);
    setSearchTerm("");
  };

  return (
    <div className="relative w-full space-y-1.5" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
        Medical College <span className="text-rose-500">*</span>
      </label>

      {/* Trigger / Selected Display */}
      {selectedCollege ? (
        <div
          onClick={() => {
            setIsOpen(!isOpen);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className={`flex items-center justify-between p-3 rounded-xl border bg-white shadow-xs cursor-pointer transition-all ${
            error
              ? "border-rose-400 ring-2 ring-rose-50"
              : "border-slate-200 hover:border-indigo-400 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100"
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <School className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-slate-900 truncate">
                  {selectedCollege.name}
                </span>
                {selectedCollege.hasVerifiedDomain && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200/60">
                    <ShieldCheck className="h-3 w-3" />
                    Verified Domain
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                {selectedCollege.city}, {selectedCollege.state} • {selectedCollege.type || "Medical Institution"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      ) : (
        <div
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className={`flex items-center justify-between p-3 rounded-xl border bg-white shadow-xs cursor-pointer transition-all ${
            error
              ? "border-rose-400 ring-2 ring-rose-50"
              : "border-slate-200 hover:border-indigo-400"
          }`}
        >
          <div className="flex items-center gap-2.5 text-slate-400 text-sm">
            <Search className="h-4 w-4 text-slate-400" />
            <span>Search 200+ Indian medical colleges (e.g. CMC, AIIMS, Stanley)...</span>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Search Field */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type college name, city, state, or acronym (e.g. AIIMS, CMC, KGMU)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mt-1.5 px-1 text-[11px] text-slate-500">
              <span>Showing {filteredColleges.length} of {colleges.length} medical colleges</span>
              {isLoading && <span className="text-indigo-600 font-medium">Loading database...</span>}
            </div>
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 p-1">
            {filteredColleges.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                <Building2 className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700">No medical colleges matched "{searchTerm}"</p>
                <p className="mt-1 text-slate-400">Try searching by state, city, or standard abbreviation.</p>
              </div>
            ) : (
              filteredColleges.map((college) => {
                const isSelected = selectedCollegeId === college.id || selectedCollegeId === college.code;
                return (
                  <button
                    key={college.id}
                    type="button"
                    onClick={() => handleSelect(college)}
                    className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between gap-3 transition-colors ${
                      isSelected
                        ? "bg-indigo-50/80 text-indigo-950 font-medium"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-medium text-slate-900">
                          {college.name}
                        </span>
                        {college.hasVerifiedDomain && college.emailDomains.length > 0 && (
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200/60">
                            @{college.emailDomains[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-2.5 w-2.5 text-slate-400" />
                        {college.city}, {college.state}
                        <span className="text-slate-300">•</span>
                        <span>{college.type}</span>
                      </p>
                    </div>

                    {isSelected && (
                      <Check className="h-4 w-4 text-indigo-600 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Expected Domain Guidance Helper (Requirement 33) */}
      {selectedCollege && (
        <div className="rounded-lg bg-indigo-50/70 border border-indigo-100 p-2.5 text-xs text-indigo-900 flex items-start gap-2 mt-1">
          <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-indigo-950">Domain Verification: </span>
            {selectedCollege.hasVerifiedDomain && selectedCollege.emailDomains.length > 0 ? (
              <span>
                Your college email must belong to an approved domain:{" "}
                <strong className="text-indigo-700">
                  {selectedCollege.emailDomains.map((d) => `@${d}`).join(", ")}
                </strong>
                . Automatic instant verification supported.
              </span>
            ) : (
              <span>
                {selectedCollege.name} does not have an automated domain directory on Synora. Enter your institutional email address; account will undergo institutional review.
              </span>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      {!error && helperText && !selectedCollege && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
}

export default CollegeSearchSelect;
