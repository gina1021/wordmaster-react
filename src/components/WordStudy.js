import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { shuffleArray } from '../utils/wordParser';
import { saveWordStatus, saveStarredWord, removeStarredWord, isWordStarred } from '../utils/database';
import './WordStudy.css';

const WordStudy = ({ words, selectedDays, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [showMeaning, setShowMeaning] = useState(false);
  const [studyComplete, setStudyComplete] = useState(false);
  const [unknownWords, setUnknownWords] = useState([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    // 단어들을 랜덤하게 섞기
    const shuffled = shuffleArray([...words]);
    setShuffledWords(shuffled);
    setCurrentIndex(0);
    setShowMeaning(false);
    setStudyComplete(false);
  }, [words]);
  
  const currentWord = shuffledWords[currentIndex];
  // 현재 단어의 별표 상태 확인
  useEffect(() => {
    const checkStarredStatus = async () => {
      if (currentWord) {
        const starred = await isWordStarred(currentWord.id);
        setIsStarred(starred);
      }
    };
    checkStarredStatus();
  }, [currentWord]);

  const progress = ((currentIndex + 1) / shuffledWords.length) * 100;

  const handleSwipeDown = () => {
    if (!showMeaning) {
      setShowMeaning(true);
    }
  };

  const handleSwipeLeft = () => {
    if (showMeaning) {
      // 왼쪽 스와이프 = 모르는 단어
      handleWordStatus('unknown');
    } else {
      // 뜻을 안 봤으므로 '외운 단어'로 처리
      handleWordStatus('learned');
    }
  };

  const handleSwipeRight = () => {
    if (showMeaning) {
      // 오른쪽 스와이프 = 아는 단어
      handleWordStatus('known');
    } else {
      // 뜻을 안 봤으므로 '외운 단어'로 처리
      handleWordStatus('learned');
    }
  };

  const handleWordStatus = async (status) => {
    if (!currentWord) return;

    try {
      // 데이터베이스에 상태 저장
      await saveWordStatus(
        currentWord.id,
        currentWord.word,
        currentWord.meaning,
        currentWord.dayNumber || 0,
        status
      );

      // 모르는 단어인 경우 별도 저장 (복습 모드에서도)
      if (status === 'unknown') {
        setUnknownWords(prev => [...prev, currentWord]);
      }

      // 다음 단어로 이동
      nextWord();
    } catch (error) {
      console.error('단어 상태 저장 중 오류:', error);
      // 오류가 발생해도 다음 단어로 이동
      nextWord();
    }
  };

  const nextWord = () => {
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowMeaning(false);
    } else {
      // 모든 단어를 다 봤을 때
      if (!isReviewMode && unknownWords.length > 0) {
        // 모르는 단어가 있으면 복습 모드로 전환
        startReviewMode();
      } else {
        // 복습도 완료했으면 학습 완료
        setStudyComplete(true);
      }
    }
  };

  const startReviewMode = () => {
    setIsReviewMode(true);
    setShuffledWords(shuffleArray([...unknownWords]));
    setCurrentIndex(0);
    setShowMeaning(false);
    setUnknownWords([]); // 복습용 배열 초기화
  };

  const handleStarToggle = async () => {
    if (!currentWord) return;

    try {
      if (isStarred) {
        await removeStarredWord(currentWord.id);
        setIsStarred(false);
      } else {
        await saveStarredWord(
          currentWord.id,
          currentWord.word,
          currentWord.meaning,
          currentWord.dayNumber || 0
        );
        setIsStarred(true);
      }
    } catch (error) {
      console.error('별표 상태 변경 중 오류:', error);
    }
  };

  const previousWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowMeaning(false);
    }
  };


  const swipeHandlers = useSwipeable({
    onSwipedDown: handleSwipeDown,
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  if (studyComplete) {
    return (
      <div className="study-complete">
      <div className="complete-content">
        <div className="complete-icon">🎉</div>
        <h2>학습 완료!</h2>
        <p>
          총 {words.length}개의 단어를 학습했습니다.
          {isReviewMode && <><br />모르는 단어 복습도 완료했습니다!</>}
        </p>
        <div className="complete-actions">
          <button className="btn btn-primary" onClick={onBack}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="study-loading">
        <div className="spinner"></div>
        <p>단어를 준비하는 중...</p>
      </div>
    );
  }

  return (
    <div className="word-study">
      {/* 헤더 */}
      <div className="study-header">
        <button className="back-btn" onClick={onBack}>
          ← 뒤로
        </button>
        <div className="progress-info">
          <div className="progress-text">
            {isReviewMode ? '복습' : '학습'} {currentIndex + 1} / {shuffledWords.length}
            {isReviewMode && <span className="review-badge">모르는 단어 복습</span>}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <button 
          className={`star-btn ${isStarred ? 'starred' : ''}`}
          onClick={handleStarToggle}
        >
          {isStarred ? '⭐' : '☆'}
        </button>
      </div>

      {/* 단어 카드 */}
      <div className="study-content">
        <div 
          className={`word-card ${showMeaning ? 'show-meaning' : ''}`}
          {...swipeHandlers}
        >
          <div className="word-section">
            <div className="word-text" style={{fontSize: '24px', color:'black'}}>{currentWord.word}</div>
            <div className="word-day">
              {currentWord.dayNumber === 'olympic' ? '수특 단어' : 
               currentWord.dayNumber ? `${currentWord.dayNumber}일차` : ''}
            </div>
          </div>
          
          <div className="meaning-section">
            <div className="meaning-text">{currentWord.meaning}</div>
          </div>

          {!showMeaning && (
            <div className="swipe-hint">
              <div className="hint-text">↓ 아래로 스와이프하여 뜻 보기</div>
            </div>
          )}
        </div>

        {/* 스와이프 안내 */}
        <div className="swipe-instructions">
          <div className="instruction-text">
            {!showMeaning ? (
              <>↓ 아래로 스와이프하여 뜻 보기</>
            ) : (
              <>
                ← 모르는 단어 | → 아는 단어
                {isReviewMode && <div className="review-hint">복습 중: 모르는 단어만 다시 학습</div>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordStudy;
