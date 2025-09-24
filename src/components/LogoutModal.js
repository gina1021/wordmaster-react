import React from 'react';
import './LogoutModal.css';

const LogoutModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>🚪 로그아웃</h3>
        </div>
        
        <div className="modal-body">
          <p>로그아웃 하시겠습니까?</p>
          <p className="modal-warning">
            로그아웃하면 현재 사용자의 학습 데이터에 접근할 수 없습니다.
          </p>
        </div>
        
        <div className="modal-actions">
          <button 
            className="btn btn-secondary"
            onClick={onCancel}
          >
            취소
          </button>
          <button 
            className="btn btn-primary"
            onClick={onConfirm}
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
