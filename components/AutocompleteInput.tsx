// components/AutocompleteInput.tsx
import React from "react";

interface AutocompleteInputProps {
    placeholder: string;
    value: string;
    filteredOptions: string[];
    showDropdown: boolean;
    onInput: (value: string) => void;
    onSelect: (option: string) => void;
    onFocus: () => void;
    onBlur: () => void;
    className?: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
     placeholder,
     value,
     filteredOptions,
     showDropdown,
     onInput,
     onSelect,
     onFocus,
     onBlur,
     className = "",
 }) => {
    return (
        <div className="relative">
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onInput(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                className={`bg-dark-200 rounded-[6px] px-5 py-2.5 w-full ${className}`}
            />
            {showDropdown && filteredOptions.length > 0 && (
                <ul className="absolute z-50 bg-dark-100 rounded-md mt-1 w-full shadow-lg max-h-48 overflow-y-auto border border-dark-300">
                    {filteredOptions.map((option) => (
                        <li
                            key={option}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                onSelect(option);
                            }}
                            className="cursor-pointer px-4 py-2 hover:bg-dark-300"
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteInput;