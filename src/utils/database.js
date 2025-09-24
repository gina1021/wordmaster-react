// IndexedDB를 사용한 사용자별 데이터베이스
const DB_VERSION = 1;
const STORE_NAME = 'wordStatus';

let db = null;

// 사용자별 데이터베이스 이름 생성
const getDatabaseName = (userId) => {
  return `WomaDatabase_${userId}`;
};

// 데이터베이스 초기화
export const initDatabase = async (userId) => {
  if (!userId) {
    throw new Error('사용자 ID가 필요합니다.');
  }
  
  const DB_NAME = getDatabaseName(userId);
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('dayNumber', 'dayNumber', { unique: false });
      }
    };
  });
};

// 단어 상태 저장
export const saveWordStatus = async (wordId, word, meaning, dayNumber, status) => {
  if (!db) return;
  
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  const wordData = {
    id: wordId,
    word: word,
    meaning: meaning,
    dayNumber: dayNumber,
    status: status,
    updatedAt: new Date().toISOString()
  };
  
  return new Promise((resolve, reject) => {
    const request = store.put(wordData);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// 단어 상태 조회
export const getWordStatus = async (wordId) => {
  if (!db) return 'unknown';
  
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.get(wordId);
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.status : 'unknown');
    };
    request.onerror = () => reject(request.error);
  });
};

// 모든 단어 상태 조회
export const getAllWordStatuses = async () => {
  if (!db) return {};
  
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const results = request.result;
      const statusMap = {};
      results.forEach(item => {
        statusMap[item.id] = item.status;
      });
      resolve(statusMap);
    };
    request.onerror = () => reject(request.error);
  });
};

// 모르는 단어 목록 조회
export const getUnknownWords = async () => {
  if (!db) return [];
  
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index('status');
  
  return new Promise((resolve, reject) => {
    const request = index.getAll('unknown');
    request.onsuccess = () => {
      const results = request.result;
      // updatedAt 기준으로 정렬 (최신순)
      results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
};

// 별표 단어 저장
export const saveStarredWord = async (wordId, word, meaning, dayNumber) => {
  if (!db) return;
  
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  const starredWordData = {
    id: `starred_${wordId}`,
    word: word,
    meaning: meaning,
    dayNumber: dayNumber,
    status: 'starred',
    updatedAt: new Date().toISOString()
  };
  
  return new Promise((resolve, reject) => {
    const request = store.put(starredWordData);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// 별표 단어 삭제
export const removeStarredWord = async (wordId) => {
  if (!db) return;
  
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.delete(`starred_${wordId}`);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// 별표 단어 목록 조회
export const getStarredWords = async () => {
  if (!db) return [];
  
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index('status');
  
  return new Promise((resolve, reject) => {
    const request = index.getAll('starred');
    request.onsuccess = () => {
      const results = request.result;
      // updatedAt 기준으로 정렬 (최신순)
      results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
};

// 단어가 별표되었는지 확인
export const isWordStarred = async (wordId) => {
  if (!db) return false;
  
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.get(`starred_${wordId}`);
    request.onsuccess = () => {
      resolve(!!request.result);
    };
    request.onerror = () => reject(request.error);
  });
};

// 통계 조회
export const getStatistics = async () => {
  if (!db) return { known: 0, learned: 0, unknown: 0, starred: 0 };
  
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const results = request.result;
      const stats = { known: 0, learned: 0, unknown: 0, starred: 0 };
      
      results.forEach(item => {
        if (item.status === 'known') stats.known++;
        else if (item.status === 'learned') stats.learned++;
        else if (item.status === 'unknown') stats.unknown++;
        else if (item.status === 'starred') stats.starred++;
      });
      
      resolve(stats);
    };
    request.onerror = () => reject(request.error);
  });
};
