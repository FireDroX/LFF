import "./AddPoints.css";
import { useState } from "react";

import { IoIosAdd } from "react-icons/io";

import { addPoints } from "../../utils/requests";

const AddPoints = ({ setTops, selectDefault, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [points, setPoints] = useState(0);
  const [selected, setSelected] = useState(selectDefault);

  return (
    <>
      <div
        className="add-points-container"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <IoIosAdd />
      </div>
      {isOpen && (
        <div className="add-points">
          <p className="grid-add1">Classement</p>
          <select
            className="grid-add2"
            name="Classement"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {Object.keys(options).map((key) => (
              <option key={key} value={key}>
                {options[key].label} {options[key].emoji}
              </option>
            ))}
          </select>
          <input
            className="grid-add3"
            type="number"
            name="Points"
            value={points}
            min="0"
            max="10000"
            onChange={(e) => {
              if (!e.target.value || e.target.value < 0) setPoints(0);
              else if (e.target.value > 10000) setPoints(10000);
              else setPoints(parseInt(e.target.value));
            }}
          />
          <button
            className="grid-add4"
            onClick={() => {
              if (points > 0) {
                addPoints(points, selected.toLowerCase()).then((newTop) => {
                  setTops((prev) => ({
                    ...prev,
                    [selected.toLowerCase()]: {
                      ...prev[selected.toLowerCase()],
                      users: newTop.users,
                    },
                  }));
                });
                setPoints(0);
                setIsOpen(false);
              }
            }}
          >
            Ajouter
          </button>
          <p className="grid-add5">{options[selected].format(points) || ""}</p>
        </div>
      )}
    </>
  );
};

export default AddPoints;
