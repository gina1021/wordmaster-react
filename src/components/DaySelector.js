import React, { useState, useRef } from 'react';
import Selecto from 'react-selecto';
import './DaySelector.css';

const DaySelector = ({ days, onStartStudy, onStudyStarredWords }) => {
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const containerRef = useRef(null);
  const selectoRef = useRef(null);

  const handleDayToggle = (dayNumber) => {
    setSelectedDays(prev => {
      if (prev.includes(dayNumber)) {
        return prev.filter(day => day !== dayNumber);
      } else {
        return [...prev, dayNumber];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedDays([]);
      setSelectAll(false);
    } else {
      const allDayNumbers = days.map(day => day.dayNumber);
      setSelectedDays(allDayNumbers);
      setSelectAll(true);
    }
  };

  const handleStartStudy = () => {
    onStartStudy(selectedDays);
  };

  const getTotalWords = () => {
    if (selectedDays.length === 0) {
      return days.reduce((total, day) => total + day.words.length, 0);
    }
    return days
      .filter(day => selectedDays.includes(day.dayNumber))
      .reduce((total, day) => total + day.words.length, 0);
  };

  // react-selecto 이벤트 핸들러
  const handleSelect = (e) => {
    const selectedElements = e.selected;
    const dayNumbers = selectedElements.map(el => parseInt(el.dataset.dayNumber));
    
    if (dayNumbers.length === 0) return;
    
    // 첫 번째 선택된 카드의 현재 상태를 기준으로 결정
    const firstDayNumber = dayNumbers[0];
    const isFirstSelected = selectedDays.includes(firstDayNumber);
    
    setSelectedDays(prev => {
      const newSelection = [...prev];
      
      if (isFirstSelected) {
        // 첫 번째 카드가 선택되어 있으면 모든 카드 선택 해제
        dayNumbers.forEach(dayNumber => {
          const index = newSelection.indexOf(dayNumber);
          if (index > -1) {
            newSelection.splice(index, 1);
          }
        });
      } else {
        // 첫 번째 카드가 선택되어 있지 않으면 모든 카드 선택
        dayNumbers.forEach(dayNumber => {
          if (!newSelection.includes(dayNumber)) {
            newSelection.push(dayNumber);
          }
        });
      }
      
      return newSelection;
    });
  };

  const handleSelectEnd = (e) => {
    const selectedElements = e.selected;
    const dayNumbers = selectedElements.map(el => parseInt(el.dataset.dayNumber));
    
    if (dayNumbers.length === 0) return;
    
    // 첫 번째 선택된 카드의 현재 상태를 기준으로 결정
    const firstDayNumber = dayNumbers[0];
    const isFirstSelected = selectedDays.includes(firstDayNumber);
    
    setSelectedDays(prev => {
      const newSelection = [...prev];
      
      if (isFirstSelected) {
        // 첫 번째 카드가 선택되어 있으면 모든 카드 선택 해제
        dayNumbers.forEach(dayNumber => {
          const index = newSelection.indexOf(dayNumber);
          if (index > -1) {
            newSelection.splice(index, 1);
          }
        });
      } else {
        // 첫 번째 카드가 선택되어 있지 않으면 모든 카드 선택
        dayNumbers.forEach(dayNumber => {
          if (!newSelection.includes(dayNumber)) {
            newSelection.push(dayNumber);
          }
        });
      }
      
      return newSelection;
    });
  };

  return (
    <div className="day-selector">
      <div className="selector-header">
        <h2>📅 학습할 일차를 선택하세요</h2>
        <p>총 {getTotalWords()}개의 단어가 선택되었습니다</p>
        <div className="drag-hint">
          💡 터치/클릭으로 선택/해제, 드래그로 범위 선택 가능합니다
        </div>
      </div>

      <div className="select-all-section">
        <button
          className={`select-all-btn ${selectAll ? 'active' : ''}`}
          onClick={handleSelectAll}
        >
          {selectAll ? '✅ 전체 선택 해제' : '☑️ 전체 선택'}
        </button>
      </div>

      <div className="days-grid" ref={containerRef}>
        {days.map(day => (
          <div
            key={day.dayNumber}
            className={`day-card ${selectedDays.includes(day.dayNumber) ? 'selected' : ''}`}
            data-day-number={day.dayNumber}
            onClick={() => handleDayToggle(day.dayNumber)}
          >
            <div className="day-number">
              {day.dayNumber}일차
            </div>
            <div className="word-count">
              {day.words.length}개 단어
            </div>
            {selectedDays.includes(day.dayNumber) && (
              <div className="selected-indicator">✓</div>
            )}
          </div>
        ))}
      </div>

      <Selecto
        ref={selectoRef}
        dragContainer={containerRef.current}
        selectableTargets={[".day-card"]}
        hitRate={0}
        selectByClick={false}
        selectFromInside={false}
        continueSelect={false}
        toggleContinueSelect={"shift"}
        ratio={0}
        onSelect={handleSelect}
        onSelectEnd={handleSelectEnd}
      />

      <div className="start-study-section">
        <button
          className="btn btn-primary start-study-btn"
          onClick={handleStartStudy}
          disabled={getTotalWords() === 0}
        >
          🚀 학습 시작하기
        </button>
        
        {onStudyStarredWords && (
          <button
            className="btn btn-warning starred-study-btn"
            onClick={onStudyStarredWords}
          >
            ⭐ 별표 단어 외우기
          </button>
        )}
      </div>
    </div>
  );
};

export default DaySelector;