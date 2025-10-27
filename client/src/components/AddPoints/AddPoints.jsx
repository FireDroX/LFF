import "./AddPoints.css";
import { useState } from "react";

import { IoIosAdd } from "react-icons/io";

import formatNumberWithSpaces from "../../utils/formatNumberWithSpaces";
import addPoints from "../../utils/addPoints";

const AddPoints = ({ setTop }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [points, setPoints] = useState(0);

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
          <input
            type="number"
            name="Points"
            value={points}
            min="0"
            max="999"
            onChange={(e) => {
              if (!e.target.value || e.target.value < 0) setPoints(0);
              else if (e.target.value > 999) setPoints(999);
              else setPoints(parseInt(e.target.value));
            }}
          />
          <button
            onClick={() => {
              if (points > 0) {
                addPoints(points).then((newTop) => {
                  setTop((prev) => ({
                    ...prev,
                    users: newTop.users,
                  }));
                });
                setPoints(0);
                setIsOpen(false);
              }
            }}
          >
            Ajouter
          </button>
          <p>
            {formatNumberWithSpaces(points)} ={" "}
            {formatNumberWithSpaces(points * 100)} Crystaux
          </p>
        </div>
      )}
    </>
  );
};

export default AddPoints;
