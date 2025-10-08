import React, { useState } from 'react';

const LearningMode = ({ 
  question, 
  userAnswer, 
  correctAnswer, 
  explanation, 
  onNext, 
  onClose,
  theme 
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const getExplanation = (question, correctAnswer, userAnswer) => {
    // Generate contextual explanations based on question content
    const questionText = question.toLowerCase();
    const correct = correctAnswer.toLowerCase();
    const user = userAnswer.toLowerCase();

    if (questionText.includes('capital')) {
      return `The capital city of this country/state is ${correctAnswer}. This is a fundamental geographical fact that's important to remember for future reference.`;
    }
    
    if (questionText.includes('year') || questionText.includes('when')) {
      return `This historical event occurred in ${correctAnswer}. Understanding the timeline of events helps build a comprehensive view of history.`;
    }
    
    if (questionText.includes('chemical') || questionText.includes('element')) {
      return `The correct answer is ${correctAnswer}. This is a fundamental concept in chemistry that forms the basis for understanding more complex chemical processes.`;
    }
    
    if (questionText.includes('formula') || questionText.includes('equation')) {
      return `The correct formula/equation is ${correctAnswer}. Mathematical formulas are building blocks for solving more complex problems in this field.`;
    }
    
    if (questionText.includes('author') || questionText.includes('wrote')) {
      return `The correct author is ${correctAnswer}. Knowing the creators of famous works helps understand the cultural and historical context of literature.`;
    }
    
    if (questionText.includes('discovered') || questionText.includes('invented')) {
      return `The correct answer is ${correctAnswer}. Understanding who made important discoveries helps appreciate the progression of human knowledge.`;
    }
    
    if (questionText.includes('largest') || questionText.includes('biggest')) {
      return `The correct answer is ${correctAnswer}. This is a comparative fact that helps understand scale and magnitude in various contexts.`;
    }
    
    if (questionText.includes('smallest') || questionText.includes('shortest')) {
      return `The correct answer is ${correctAnswer}. Understanding extremes helps build a complete picture of the range of possibilities.`;
    }
    
    // General explanations based on answer characteristics
    if (correctAnswer.length <= 3) {
      return `The correct answer is ${correctAnswer}. Short answers often represent fundamental concepts or key terms in the subject area.`;
    }
    
    if (correctAnswer.length >= 15) {
      return `The correct answer is ${correctAnswer}. Longer answers often represent complex concepts or detailed explanations.`;
    }
    
    // Default explanation
    return `The correct answer is ${correctAnswer}. This question tests your knowledge of ${questionText.includes('science') ? 'scientific' : questionText.includes('history') ? 'historical' : questionText.includes('geography') ? 'geographical' : 'general'} concepts. Take time to review this topic to strengthen your understanding.`;
  };

  const handleShowExplanation = () => {
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (onNext) onNext();
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  const themeClasses = {
    bg: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
    panelBg: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    button: theme === 'dark' 
      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' 
      : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
  };

  const generatedExplanation = explanation || getExplanation(question, correctAnswer, userAnswer);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className={`${themeClasses.panelBg} ${themeClasses.text} w-full max-w-2xl rounded-xl p-6 shadow-2xl border ${themeClasses.border} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-blue-500">📚</span>
            Learning Mode
          </h3>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✖
          </button>
        </div>

        <div className="space-y-6">
          {/* Question */}
          <div className={`${themeClasses.panelBg} rounded-lg p-4 border ${themeClasses.border}`}>
            <h4 className="font-semibold mb-2 text-lg">Question:</h4>
            <p className={themeClasses.textSecondary}>{question}</p>
          </div>

          {/* Answer Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-4">
              <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                <span>❌</span> Your Answer
              </h4>
              <p className="text-red-200">{userAnswer}</p>
            </div>
            
            <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                <span>✅</span> Correct Answer
              </h4>
              <p className="text-green-200">{correctAnswer}</p>
            </div>
          </div>

          {/* Explanation */}
          <div className={`${themeClasses.panelBg} rounded-lg p-4 border ${themeClasses.border}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <span className="text-yellow-500">💡</span>
                Explanation
              </h4>
              {!showExplanation && (
                <button
                  onClick={handleShowExplanation}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors"
                >
                  Show Explanation
                </button>
              )}
            </div>
            
            {showExplanation && (
              <div className="space-y-3">
                <p className={themeClasses.textSecondary}>{generatedExplanation}</p>
                
                {/* Additional Learning Tips */}
                <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3">
                  <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                    <span>🎯</span> Learning Tip
                  </h5>
                  <p className="text-blue-200 text-sm">
                    Try to understand the reasoning behind this answer rather than just memorizing it. 
                    This will help you apply the knowledge to similar questions in the future.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Related Topics */}
          <div className={`${themeClasses.panelBg} rounded-lg p-4 border ${themeClasses.border}`}>
            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <span className="text-purple-500">🔗</span>
              Related Topics to Explore
            </h4>
            <div className="flex flex-wrap gap-2">
              {question.toLowerCase().includes('science') && (
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">Scientific Method</span>
              )}
              {question.toLowerCase().includes('history') && (
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">Historical Context</span>
              )}
              {question.toLowerCase().includes('geography') && (
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">Geographical Facts</span>
              )}
              {question.toLowerCase().includes('math') && (
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">Mathematical Concepts</span>
              )}
              <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm">General Knowledge</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleNext}
            className={`flex-1 ${themeClasses.button} text-white py-3 px-6 rounded-lg font-medium transition-all hover:scale-105`}
          >
            Continue Learning
          </button>
          <button
            onClick={handleClose}
            className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningMode;
