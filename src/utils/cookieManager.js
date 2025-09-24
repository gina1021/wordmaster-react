// 쿠키 관리 유틸리티
export const setCookie = (name, value) => {
  document.cookie = `${name}=${value};path=/`;
};

export const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// ID 유효성 검사
export const validateUserId = (userId) => {
  if (!userId) return false;
  // 영어만 허용, 길이 제한 없음
  return /^[a-zA-Z]+$/.test(userId);
};

// 사용자 활동 추적 데이터 구조
const getUserActivityData = () => {
  return JSON.parse(localStorage.getItem('woma_user_activity') || '{}');
};

const saveUserActivityData = (data) => {
  localStorage.setItem('woma_user_activity', JSON.stringify(data));
};

// 로컬 스토리지에서 중복 ID 체크
export const checkUserIdExists = (userId) => {
  const userActivity = getUserActivityData();
  return userActivity.hasOwnProperty(userId);
};

// 사용자 ID 등록 및 활동 기록
export const registerUserId = (userId) => {
  const userActivity = getUserActivityData();
  userActivity[userId] = {
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  saveUserActivityData(userActivity);
};

// 사용자 로그인 시간 업데이트
export const updateUserLoginTime = (userId) => {
  const userActivity = getUserActivityData();
  if (userActivity[userId]) {
    userActivity[userId].lastLogin = new Date().toISOString();
    saveUserActivityData(userActivity);
  }
};

// 2주간 비활성화된 사용자 ID 정리
export const cleanupInactiveUsers = () => {
  const userActivity = getUserActivityData();
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const activeUsers = {};
  let cleanedCount = 0;
  
  Object.keys(userActivity).forEach(userId => {
    const lastLogin = new Date(userActivity[userId].lastLogin);
    if (lastLogin > twoWeeksAgo) {
      activeUsers[userId] = userActivity[userId];
    } else {
      cleanedCount++;
      // 해당 사용자의 데이터베이스도 삭제
      deleteUserDatabase(userId);
    }
  });
  
  if (cleanedCount > 0) {
    saveUserActivityData(activeUsers);
    console.log(`${cleanedCount}명의 비활성 사용자가 정리되었습니다.`);
  }
  
  return cleanedCount;
};

// 사용자 데이터베이스 삭제
const deleteUserDatabase = (userId) => {
  const dbName = `WomaDatabase_${userId}`;
  const deleteRequest = indexedDB.deleteDatabase(dbName);
  
  deleteRequest.onsuccess = () => {
    console.log(`사용자 ${userId}의 데이터베이스가 삭제되었습니다.`);
  };
  
  deleteRequest.onerror = () => {
    console.error(`사용자 ${userId}의 데이터베이스 삭제 중 오류가 발생했습니다.`);
  };
};
