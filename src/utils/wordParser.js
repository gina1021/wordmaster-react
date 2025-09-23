// 단어 리스트 파싱 유틸리티
export const parseWordList = (text) => {
  const lines = text.split('\n');
  const days = [];
  let currentDay = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 일차 번호 감지 (숫자만 있는 줄)
    if (/^\d+$/.test(line)) {
      if (currentDay) {
        days.push(currentDay);
      }
      currentDay = {
        dayNumber: parseInt(line),
        words: []
      };
    } else if (currentDay && line && line !== '') {
      // 단어와 뜻 파싱
      const parts = line.split(' ');
      if (parts.length >= 2) {
        const word = parts[0];
        const meaning = parts.slice(1).join(' ');
        currentDay.words.push({
          word,
          meaning,
          id: `${currentDay.dayNumber}_${currentDay.words.length + 1}`
        });
      }
    }
  }
  
  // 마지막 일차 추가
  if (currentDay) {
    days.push(currentDay);
  }
  
  return days;
};

// 모든 단어를 하나의 배열로 합치기 (여러 일차 동시 학습용)
export const getAllWords = (days) => {
  return days.reduce((allWords, day) => {
    return [...allWords, ...day.words.map(word => ({
      ...word,
      dayNumber: day.dayNumber
    }))];
  }, []);
};

// 수특 단어 리스트 파싱 (일차 구분 없이 전체를 하나의 일차로 처리)
export const parseOlympicWords = (text) => {
  const lines = text.split('\n');
  const words = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line && line !== '') {
      // 단어와 뜻 파싱 (| 구분자 사용)
      const pipeIndex = line.indexOf('|');
      if (pipeIndex !== -1) {
        const word = line.substring(0, pipeIndex).trim();
        const meaning = line.substring(pipeIndex + 1).trim();
        if (word && meaning) {
          words.push({
            word,
            meaning,
            id: `olympic_${i + 1}`,
            dayNumber: 'olympic'
          });
        }
      }
    }
  }
  
  return words;
};

// 단어 배열을 랜덤하게 섞기
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
