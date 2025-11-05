import { useState } from "react";
import "./Dropdown.css";

const Dropdown = ({ types, items, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleSelect = (item) => {
    setSelected(item);
    onSelect(item.label.toLowerCase());
    setIsOpen(false);
  };

  return (
    <div className="dropdown">
      <button
        type="button"
        className="dropdown-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {selected ? (
          <div className="dropdown-selected">
            <img src={selected.icon} alt={selected.label} />
            <span>{selected.label}</span>
          </div>
        ) : (
          <span>Sélectionner un classement</span>
        )}
      </button>

      {isOpen && (
        <ul className="dropdown-menu">
          {types.map((type, i) => {
            const option = items[type] || {};

            return (
              <li
                key={i}
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect(option, i);
                }}
              >
                <img src={option.icon} alt={option.label} />
                <span>{option.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
