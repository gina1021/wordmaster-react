import React, { useState, useEffect } from 'react';
import './App.css';
import WordStudy from './components/WordStudy';
import DaySelector from './components/DaySelector';
import Statistics from './components/Statistics';
import { initDatabase, getStarredWords } from './utils/database';
import { parseWordList, parseOlympicWords } from './utils/wordParser';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'study', 'statistics'
  const [selectedDays, setSelectedDays] = useState([]);
  const [words, setWords] = useState([]);
  const [days, setDays] = useState([]);
  const [olympicWords, setOlympicWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 데이터베이스 초기화
        await initDatabase();
        
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
        console.error('데이터 로딩 중 오류:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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

  return (
    <div className="app">
      {currentView === 'home' && (
        <div className="home">
          <header className="app-header">
            <h1>📚 WOMA 단어장</h1>
            <p>모바일 단어 학습 앱</p>
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
    </div>
  );
}

export default App;
