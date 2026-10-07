import React from 'react';

const DeletePopup = ({ isOpen, hotelTitle, onConfirm, onCancel, isDeleting = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-icon-danger">⚠️</div>
          <h4 className="modal-title" id="delete-dialog-title">Confirm Delete</h4>
        </div>

        <p className="modal-message">
          Are you sure you want to delete <strong>{hotelTitle || 'this hotel'}</strong>?
          This action cannot be undone and will permanently remove the hotel records and associated image.
        </p>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
            id="cancel-delete-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
            id="confirm-delete-btn"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePopup;
