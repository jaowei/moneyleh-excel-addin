import React, { useState } from "react";

interface ComboboxProps {
  options: string[];
  onOptionChange: (option: string | null) => void;
  placeholder?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({ options, onOptionChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleOptionClick = (option: string) => {
    onOptionChange(option);
    setInputValue(option);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prevIndex) => Math.min(prevIndex + 1, filteredOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      handleOptionClick(filteredOptions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleClearClick = () => {
    onOptionChange(null);
    setInputValue("");
    setIsOpen(false);
  };

  const filteredOptions = options.filter((option) => option.toLowerCase().includes(inputValue.toLowerCase()));

  return (
    <div className="dropdown">
      <label className="input input-bordered">
        <input
          type="text"
          value={inputValue}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
        />
        {inputValue && (
          <button onClick={handleClearClick} className="combobox-clear-button">
            &times;
          </button>
        )}
      </label>
      {isOpen && (
        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box  w-52 p-2 shadow-sm">
          {filteredOptions.map((option, index) => (
            <li
              key={option}
              onClick={() => handleOptionClick(option)}
              className={index === highlightedIndex ? "bg-base-200" : ""}
            >
              <span>{option}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
