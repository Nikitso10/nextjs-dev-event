import { useState } from "react";

interface UseAutocompleteProps {
    allOptions: string[];
    multiSelect?: boolean; // For comma-separated values like tags
}

export const useAutocomplete = ({ allOptions, multiSelect = false }: UseAutocompleteProps) => {
    const [value, setValue] = useState("");
    const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleInput = (inputValue: string) => {
        setValue(inputValue);

        let currentInput: string;

        if (multiSelect) {
            // Extract the current tag being typed (after the last comma)
            const parts = inputValue.split(",");
            currentInput = parts[parts.length - 1].trim().toLowerCase();
        } else {
            currentInput = inputValue.trim().toLowerCase();
        }

        if (!currentInput) {
            setFilteredOptions([]);
            setShowDropdown(false);
            return;
        }

        // Show matching options
        const matches = allOptions.filter((option) =>
            option.toLowerCase().includes(currentInput)
        );

        setFilteredOptions(matches.slice(0, 10));
        setShowDropdown(matches.length > 0);
    };

    const handleSelect = (option: string) => {
        if (multiSelect) {
            // Replace the last typed segment with the selected option
            const parts = value.split(",").map((p) => p.trim()).filter(Boolean);

            // Replace or append option
            if (parts.length > 0 && !value.endsWith(",")) {
                parts[parts.length - 1] = option;
            } else {
                parts.push(option);
            }

            const newValue = Array.from(new Set(parts)).join(", ");
            setValue(newValue);
        } else {
            setValue(option);
        }

        setShowDropdown(false);
        setFilteredOptions([]);
    };

    const handleFocus = () => {
        if (value) {
            handleInput(value); // Re-filter on focus
        }
    };

    const handleBlur = () => {
        setTimeout(() => setShowDropdown(false), 200);
    };

    return {
        value,
        setValue,
        filteredOptions,
        showDropdown,
        handleInput,
        handleSelect,
        handleFocus,
        handleBlur,
    };
};