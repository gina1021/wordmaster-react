import React, { useState, useEffect } from 'react';
import { getStatistics, getUnknownWords, getStarredWords } from '../utils/database';
import './Statistics.css';

const Statistics = ({ onBack, onStudyWords }) => {
  const [stats, setStats] = useState({ known: 0, learned: 0, unknown: 0, starred: 0 });
  const [unknownWords, setUnknownWords] = useState([]);
  const [starredWords, setStarredWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const statistics = await getStatistics();
      const unknown = await getUnknownWords();
      const starred = await getStarredWords();
      
      setStats(statistics);
      setUnknownWords(unknown);
      setStarredWords(starred);
      setLoading(false);
    } catch (error) {
      console.error('통계 로딩 중 오류:', error);
      setLoading(false);
    }
  };

  const getTotalWords = () => {
    return stats.known + stats.learned + stats.unknown;
  };

  const getProgressPercentage = () => {
    const total = getTotalWords();
    if (total === 0) return 0;
    return Math.round(((stats.known + stats.learned) / total) * 100);
  };

  const handleStudyWords = (words, type) => {
    if (onStudyWords) {
      onStudyWords(words, type);
    }
  };

  if (loading) {
    return (
      <div className="statistics">
        <div className="statistics-header">
          <button className="back-btn" onClick={onBack}>
            ← 뒤로
          </button>
          <h2>📊 학습 통계</h2>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          <p>통계를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics">
      <div className="statistics-header">
        <button className="back-btn" onClick={onBack}>
          ← 뒤로
        </button>
        <h2>📊 학습 통계</h2>
      </div>

      <div className="statistics-content">
        {/* 전체 통계 */}
        <div className="stats-overview">
          <div className="progress-circle">
            <div className="circle">
              <div className="progress-text">
                <div className="percentage">{getProgressPercentage()}%</div>
                <div className="label">학습 완료</div>
              </div>
            </div>
          </div>
          
          <div className="stats-summary">
            <div className="stat-item">
              <div className="stat-number">{getTotalWords()}</div>
              <div className="stat-label">총 학습 단어</div>
            </div>
          </div>
        </div>

        {/* 상세 통계 */}
        <div className="stats-details">
          <div className="stat-card known">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-number">{stats.known}</div>
              <div className="stat-label">아는 단어</div>
            </div>
          </div>

          <div className="stat-card learned">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <div className="stat-number">{stats.learned}</div>
              <div className="stat-label">외운 단어</div>
            </div>
          </div>

          <div className="stat-card unknown">
            <div className="stat-icon">❓</div>
            <div className="stat-info">
              <div className="stat-number">{stats.unknown}</div>
              <div className="stat-label">모르는 단어</div>
            </div>
          </div>

          <div className="stat-card starred">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <div className="stat-number">{stats.starred}</div>
              <div className="stat-label">별표 단어</div>
            </div>
          </div>
        </div>

        {/* 모르는 단어 목록 */}
        {unknownWords.length > 0 && (
          <div className="unknown-words-section">
            <div className="section-header">
              <h3>📝 모르는 단어 목록</h3>
              <button 
                className="btn btn-primary study-btn"
                onClick={() => handleStudyWords(unknownWords, '모르는 단어')}
              >
                📚 외우기
              </button>
            </div>
            <div className="unknown-words-list">
              {unknownWords.slice(0, 10).map((word, index) => (
                <div key={word.id} className="unknown-word-item">
                  <div className="word-info">
                    <div className="word-text">{word.word}</div>
                    <div className="word-meaning">{word.meaning}</div>
                    <div className="word-day">{word.day_number}일차</div>
                  </div>
                </div>
              ))}
              {unknownWords.length > 10 && (
                <div className="more-words">
                  +{unknownWords.length - 10}개 더...
                </div>
              )}
            </div>
          </div>
        )}

        {/* 별표 단어 목록 */}
        {starredWords.length > 0 && (
          <div className="starred-words-section">
            <div className="section-header">
              <h3>⭐ 별표 단어 목록</h3>
              <button 
                className="btn btn-warning study-btn"
                onClick={() => handleStudyWords(starredWords, '별표 단어')}
              >
                📚 외우기
              </button>
            </div>
            <div className="starred-words-list">
              {starredWords.slice(0, 10).map((word, index) => (
                <div key={word.id} className="starred-word-item">
                  <div className="word-info">
                    <div className="word-text">{word.word}</div>
                    <div className="word-meaning">{word.meaning}</div>
                    <div className="word-day">{word.day_number}일차</div>
                  </div>
                </div>
              ))}
              {starredWords.length > 10 && (
                <div className="more-words">
                  +{starredWords.length - 10}개 더...
                </div>
              )}
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="statistics-actions">
          <button 
            className="btn btn-primary"
            onClick={loadStatistics}
          >
            🔄 통계 새로고침
          </button>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
