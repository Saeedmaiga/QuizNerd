const he = require('he');

// Fisher-Yates shuffle
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function mapOpenTDB(results) {
  return results.map((r, index) => {
    const correct = he.decode(r.correct_answer);
    const incorrect = r.incorrect_answers.map(he.decode);
    const options = shuffle([correct, ...incorrect]).map(t => ({ 
      text: t, 
      isCorrect: t === correct 
    }));
    
    return {
      text: he.decode(r.question),
      type: r.type === 'boolean' ? 'TRUE_FALSE' : 'MULTIPLE_CHOICE',
      order: index + 1,
      options,
      category: r.category,
      difficulty: r.difficulty,
      source: 'OPENTDB'
    };
  });
}

function mapTriviaApi(items) {
  return items.map((item, index) => {
    const options = shuffle([item.correctAnswer, ...item.incorrectAnswers]).map(t => ({ 
      text: t, 
      isCorrect: t === item.correctAnswer 
    }));
    
    return {
      text: item.question,
      type: item.type === 'boolean' ? 'TRUE_FALSE' : 'MULTIPLE_CHOICE',
      order: index + 1,
      options,
      category: item.category,
      difficulty: item.difficulty,
      source: 'TRIVIA_API'
    };
  });
}

module.exports = { mapOpenTDB, mapTriviaApi };