import React, { useState } from 'react';
import { setCookie, validateUserId, checkUserIdExists, registerUserId, updateUserLoginTime } from '../utils/cookieManager';
import './CreateUserId.css';

const CreateUserId = ({ onUserIdCreated }) => {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 입력값 검증
    if (!userId.trim()) {
      setError('ID를 입력해주세요.');
      return;
    }

    if (!validateUserId(userId)) {
      setError('ID는 영어만 사용할 수 있습니다.');
      return;
    }

    const userExists = checkUserIdExists(userId);
    
    if (userExists) {
      // 기존 사용자 로그인
      updateUserLoginTime(userId);
      setCookie('id', userId);
      onUserIdCreated(userId);
    } else {
      // 새 사용자 생성
      registerUserId(userId);
      setCookie('id', userId);
      onUserIdCreated(userId);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserId(value);
    setError(''); // 입력 시 에러 메시지 초기화
  };

  return (
    <div className="create-user-id">
      <div className="create-id-container">
        <div className="create-id-header">
          <h1>👤 로그인 / ID 생성</h1>
          <p>기존 ID로 로그인하거나 새 ID를 만들어주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="create-id-form">
          <div className="input-group">
            <label htmlFor="userId">사용자 ID</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={handleInputChange}
              placeholder="영어로만 입력해주세요"
              className={error ? 'error' : ''}
              autoFocus
            />
            {error && <div className="error-message">{error}</div>}
          </div>

          <button type="submit" className="btn btn-primary create-btn">
            로그인 / ID 생성
          </button>
        </form>

        <div className="create-id-info">
          <h3>📝 안내사항</h3>
          <ul>
            <li>ID는 영어로만 입력해주세요</li>
            <li>길이 제한은 없습니다</li>
            <li>기존 ID면 로그인, 새 ID면 자동 생성됩니다</li>
            <li>2주간 미접속 시 자동 삭제됩니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateUserId;
