import "./RemovePoints.css";

import { MdCancel } from "react-icons/md";

import removePoints from "../../utils/removePoints";

const RemovePoints = ({ closeModal }) => {
  const handleRemovePoints = () => {
    removePoints().then(() => {
      closeModal();
      window.location.reload();
    });
  };

  return (
    <div className="removePoints-modal">
      <div className="removePoints-cancel" onClick={closeModal}>
        <MdCancel />
      </div>
      <h5 className="removePoints-grid1">Supprimez vos points ?</h5>
      <button className="removePoints-grid2" onClick={handleRemovePoints}>
        Supprimer
      </button>
      <button className="removePoints-grid3" onClick={closeModal}>
        Annuler
      </button>
    </div>
  );
};

export default RemovePoints;
