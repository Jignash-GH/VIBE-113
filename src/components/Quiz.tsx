import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Brain, Loader2 } from 'lucide-react';

interface QuizAnswers {
  coding_level_score: number;
  coding_proficiency_score: number;
  decision_making_score: number;
  cgpa: number;
  real_life_application_score: number;
}

export function Quiz({ onComplete }: { onComplete: () => void }) {
  const { user, refreshProfile } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    coding_level_score: 0,
    coding_proficiency_score: 0,
    decision_making_score: 0,
    cgpa: 0,
    real_life_application_score: 0,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ category: string; analysis: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const questions = [
    {
      id: 'coding_level_score',
      question: 'How would you rate your current coding level?',
      options: [
        { value: 1, label: 'Beginner - Just starting out' },
        { value: 2, label: 'Intermediate - Comfortable with basics' },
        { value: 3, label: 'Advanced - Confident problem solver' },
      ],
    },
    {
      id: 'coding_proficiency_score',
      question: 'How well do you understand programming concepts?',
      options: [
        { value: 1, label: 'Need detailed explanations' },
        { value: 2, label: 'Understand with some examples' },
        { value: 3, label: 'Grasp concepts quickly' },
      ],
    },
    {
      id: 'decision_making_score',
      question: 'How confident are you in making coding decisions?',
      options: [
        { value: 1, label: 'Need guidance for most decisions' },
        { value: 2, label: 'Can decide with some research' },
        { value: 3, label: 'Make informed decisions independently' },
      ],
    },
    {
      id: 'cgpa',
      question: 'What is your current CGPA or GPA?',
      type: 'number',
      min: 1,
      max: 10,
    },
    {
      id: 'real_life_application_score',
      question: 'How well can you apply coding concepts to real-life problems?',
      options: [
        { value: 1, label: 'Struggle to see connections' },
        { value: 2, label: 'Sometimes see applications' },
        { value: 3, label: 'Easily identify use cases' },
      ],
    },
  ];

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    console.log('Quiz: User object:', user);
    setError(null);
    
    if (!user) {
      console.error('Quiz: No user found');
      setError('User not found. Please sign in again.');
      return;
    }

    setLoading(true);
    try {
      // Fallback: Calculate score locally if Edge Function fails
      const totalScore =
        answers.coding_level_score +
        answers.coding_proficiency_score +
        answers.decision_making_score +
        (answers.cgpa / 10) * 3 + // Normalize CGPA (1-10) to 0-3 scale
        answers.real_life_application_score;

      const maxScore = 15; // 3+3+3+3+3 = 15 (all normalized to same scale)
      const percent = Math.max(0, Math.min(100, (totalScore / maxScore) * 100));
      
      // Better categorization logic
      let category: string;
      if (percent <= 30) {
        category = 'spoonfeeder'; // Beginner - needs structured guidance
      } else if (percent <= 60) {
        category = 'spoonfeeder'; // Still needs structured approach
      } else {
        category = 'well-idea'; // Advanced - can work independently
      }
      
      const analysisText = `Based on your scores, you're categorized as ${category === 'spoonfeeder' ? 'Structured Learning' : 'Advanced Track'} with ${percent.toFixed(1)}% overall proficiency.`;

      // Try Edge Function first, fallback to local calculation
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session?.access_token) {
          const { data } = await supabase.functions.invoke('analyze-quiz', {
            body: answers,
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
          });

          if (data?.success) {
            setResult({ category: data.category, analysis: data.analysis });

            await supabase.functions.invoke('generate-learning-content', {
              body: { generate_initial: true },
              headers: {
                Authorization: `Bearer ${sessionData.session.access_token}`,
              },
            });

            await refreshProfile();
            onComplete();
            return;
          }
        }
      } catch (edgeFunctionError) {
        console.warn('Edge Function failed, using fallback:', edgeFunctionError);
      }

      // Fallback: Update profile locally and proceed
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        const { error: updateError } = await (supabase as any)
          .from('profiles')
          .update({ learning_level: category })
          .eq('id', sessionData.session.user.id);
        
        if (updateError) {
          console.warn('Failed to update profile locally:', updateError);
        }
      }

      setResult({ category, analysis: analysisText });
      await refreshProfile();
      onComplete();
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError(`Error submitting quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentQuestion];
  const isAnswered = answers[currentQ.id as keyof QuizAnswers] > 0;
  const isLastQuestion = currentQuestion === questions.length - 1;

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Assessment Complete</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-lg font-semibold text-blue-900 mb-2">
              Your Learning Level: {result.category === 'spoonfeeder' ? 'Structured Learning' : 'Advanced Track'}
            </p>
            <p className="text-gray-700">{result.analysis}</p>
          </div>
          <p className="text-gray-600">Generating your personalized learning path...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-6">{currentQ.question}</h3>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {currentQ.type === 'number' ? (
          <div className="mb-8">
            <input
              type="number"
              min={currentQ.min}
              max={currentQ.max}
              value={answers[currentQ.id as keyof QuizAnswers] || ''}
              onChange={(e) => handleAnswer(currentQ.id, parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter value (${currentQ.min}-${currentQ.max})`}
            />
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {currentQ.options?.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(currentQ.id, option.value)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[currentQ.id as keyof QuizAnswers] === option.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      answers[currentQ.id as keyof QuizAnswers] === option.value
                        ? 'border-blue-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {answers[currentQ.id as keyof QuizAnswers] === option.value && (
                      <div className="w-3 h-3 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <span className="font-medium text-gray-800">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!isAnswered || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Submit Quiz'
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
