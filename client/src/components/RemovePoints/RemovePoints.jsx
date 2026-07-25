import "./RemovePoints.css";

import { MdCancel } from "react-icons/md";

const RemovePoints = ({ closeModal }) => {
  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="removePoints-modal" onClick={(e) => e.stopPropagation()}>
        <div className="removePoints-cancel" onClick={closeModal}>
          <MdCancel />
        </div>
        <small className="removePoints-grid1">
          Fonction supprimée. <br />
          Merci d'utiliser le bot sur le discord
          <br />
          (/points remove {"<top> <amount>"})
        </small>
        <button className="removePoints-grid2">Supprimer</button>
        <button className="removePoints-grid3" onClick={closeModal}>
          Annuler
        </button>
      </div>
    </div>
  );
};

export default RemovePoints;
