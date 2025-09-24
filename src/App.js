import React, { useState, useEffect } from 'react';
import './App.css';
import WordStudy from './components/WordStudy';
import DaySelector from './components/DaySelector';
import Statistics from './components/Statistics';
import CreateUserId from './components/CreateUserId';
import LogoutModal from './components/LogoutModal';
import { initDatabase, getStarredWords } from './utils/database';
import { parseWordList, parseOlympicWords } from './utils/wordParser';
import { getCookie, deleteCookie, validateUserId, updateUserLoginTime, cleanupInactiveUsers } from './utils/cookieManager';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'study', 'statistics'
  const [selectedDays, setSelectedDays] = useState([]);
  const [words, setWords] = useState([]);
  const [days, setDays] = useState([]);
  const [olympicWords, setOlympicWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 비활성 사용자 정리 (앱 시작 시마다 실행)
        cleanupInactiveUsers();
        
        // 쿠키에서 사용자 ID 확인
        const cookieUserId = getCookie('id');
        
        if (!cookieUserId || !validateUserId(cookieUserId)) {
          // 유효한 ID가 없으면 ID 생성 화면으로
          setIsLoading(false);
          return;
        }
        
        // 유효한 ID가 있으면 사용자 설정 및 데이터 로드
        setUserId(cookieUserId);
        updateUserLoginTime(cookieUserId); // 로그인 시간 업데이트
        await loadUserData(cookieUserId);
        
      } catch (error) {
        console.error('앱 초기화 중 오류:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const loadUserData = async (user) => {
    try {
      // 사용자별 데이터베이스 초기화
      await initDatabase(user);
      
      // 단어 리스트 로드
      const response = await fetch('/list.txt');
      const wordListText = await response.text();
      const parsedDays = parseWordList(wordListText);
      setDays(parsedDays);
      
      // 수특 단어 리스트 로드
      const olympicResponse = await fetch('/olym.txt');
      const olympicText = await olympicResponse.text();
      const parsedOlympicWords = parseOlympicWords(olympicText);
      setOlympicWords(parsedOlympicWords);
      
      setIsLoading(false);
    } catch (error) {
      console.error('사용자 데이터 로딩 중 오류:', error);
      setIsLoading(false);
    }
  };

  const handleStartStudy = (selectedDayNumbersOrWords, type) => {
    if (Array.isArray(selectedDayNumbersOrWords) && selectedDayNumbersOrWords.length > 0 && selectedDayNumbersOrWords[0].word) {
      // 단어 배열이 직접 전달된 경우 (모르는 단어, 별표 단어)
      setWords(selectedDayNumbersOrWords);
      setSelectedDays([]);
    } else {
      // 일차 번호 배열이 전달된 경우
      const selectedDayNumbers = selectedDayNumbersOrWords;
      setSelectedDays(selectedDayNumbers);
      
      if (selectedDayNumbers.length === 0) {
        // 모든 단어 선택
        const allWords = days.reduce((acc, day) => [...acc, ...day.words], []);
        setWords(allWords);
      } else {
        // 선택된 일차의 단어들만
        const selectedWords = days
          .filter(day => selectedDayNumbers.includes(day.dayNumber))
          .reduce((acc, day) => [...acc, ...day.words], []);
        setWords(selectedWords);
      }
    }
    
    setCurrentView('study');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedDays([]);
    setWords([]);
  };

  const handleStudyStarredWords = async () => {
    try {
      const starredWords = await getStarredWords();
      if (starredWords.length === 0) {
        alert('별표된 단어가 없습니다.');
        return;
      }
      handleStartStudy(starredWords, '별표 단어');
    } catch (error) {
      console.error('별표 단어 로딩 중 오류:', error);
      alert('별표 단어를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleStudyOlympicWords = () => {
    if (olympicWords.length === 0) {
      alert('수특 단어가 없습니다.');
      return;
    }
    handleStartStudy(olympicWords, '수특 단어');
  };

  const handleUserIdCreated = async (newUserId) => {
    setUserId(newUserId);
    await loadUserData(newUserId);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    deleteCookie('id');
    setUserId(null);
    setShowLogoutModal(false);
    setCurrentView('home');
    setSelectedDays([]);
    setWords([]);
    setDays([]);
    setOlympicWords([]);
    setIsLoading(false); // ID 생성 화면으로 바로 이동
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>단어장을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // ID가 없으면 ID 생성 화면 표시
  if (!userId) {
    return (
      <div className="app">
        <CreateUserId onUserIdCreated={handleUserIdCreated} />
      </div>
    );
  }

  return (
    <div className="app">
      {currentView === 'home' && (
        <div className="home">
          <header className="app-header">
            <div className="header-content">
              <div className="header-title">
                <h1>📚 WOMA 단어장</h1>
                <p>모바일 단어 학습 앱</p>
              </div>
              <div className="user-info">
                <button 
                  className="user-id-btn"
                  onClick={handleLogout}
                  title="로그아웃"
                >
                  👤 {userId}
                </button>
              </div>
            </div>
          </header>
          
          <div className="home-content">
            <DaySelector 
              days={days} 
              onStartStudy={handleStartStudy}
              onStudyStarredWords={() => handleStudyStarredWords()}
            />
            
            <div className="home-actions">
              <button 
                className="btn btn-primary olympic-btn"
                onClick={handleStudyOlympicWords}
              >
                🏆 수특 단어 ({olympicWords.length}개)
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setCurrentView('statistics')}
              >
                📊 학습 통계
              </button>
            </div>
          </div>
        </div>
      )}
      
      {currentView === 'study' && (
        <WordStudy 
          words={words}
          selectedDays={selectedDays}
          onBack={handleBackToHome}
        />
      )}
      
      {currentView === 'statistics' && (
        <Statistics 
          onBack={() => setCurrentView('home')}
          onStudyWords={handleStartStudy}
        />
      )}
      
      {/* 로그아웃 확인 모달 */}
      <LogoutModal 
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </div>
  );
}

export default App;
