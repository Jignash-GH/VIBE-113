import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, CheckCircle, Circle, Plus, Loader2 } from 'lucide-react';

interface Concept {
  id: string;
  concept_name: string;
  concept_description: string;
  is_completed: boolean;
  difficulty_level: string;
  order_index: number;
}

export function LearningPath() {
  const { user } = useAuth();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddConcept, setShowAddConcept] = useState(false);
  const [newConceptName, setNewConceptName] = useState('');
  const [addingConcept, setAddingConcept] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConcepts();
    }
  }, [user]);

  const fetchConcepts = async () => {
    const { data, error } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', user?.id)
      .order('order_index', { ascending: true });

    if (!error && data) {
      setConcepts(data);
    }
    setLoading(false);
  };

  const markAsRead = async (conceptId: string) => {
    const { error } = await supabase
      .from('learning_progress')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('id', conceptId);

    if (!error) {
      setConcepts((prev) =>
        prev.map((c) => (c.id === conceptId ? { ...c, is_completed: true } : c))
      );
    }
  };

  const addCustomConcept = async () => {
    if (!newConceptName.trim()) return;

    setAddingConcept(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-learning-content`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ concept_name: newConceptName }),
        }
      );

      if (response.ok) {
        await fetchConcepts();
        setNewConceptName('');
        setShowAddConcept(false);
      }
    } catch (error) {
      console.error('Error adding concept:', error);
    } finally {
      setAddingConcept(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const completedCount = concepts.filter((c) => c.is_completed).length;
  const progress = concepts.length > 0 ? (completedCount / concepts.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Your Learning Path</h2>
          </div>
          <button
            onClick={() => setShowAddConcept(!showAddConcept)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Concept
          </button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Progress: {completedCount} of {concepts.length} completed
            </span>
            <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {showAddConcept && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              Add a concept you want to learn
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newConceptName}
                onChange={(e) => setNewConceptName(e.target.value)}
                placeholder="e.g., Binary Search, Linked Lists"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addCustomConcept()}
              />
              <button
                onClick={addCustomConcept}
                disabled={addingConcept || !newConceptName.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {addingConcept ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Add'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {concepts.map((concept, index) => (
          <div
            key={concept.id}
            className={`bg-white rounded-xl shadow-sm p-6 transition-all ${
              concept.is_completed ? 'opacity-75' : ''
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                {concept.is_completed ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-500 mr-3">
                    {index + 1}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {concept.concept_name}
                  </h3>
                  {concept.difficulty_level === 'beginner' && (
                    <span className="ml-3 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Beginner
                    </span>
                  )}
                  {concept.difficulty_level === 'advanced' && (
                    <span className="ml-3 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      Advanced
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {concept.concept_description}
                </p>
                {!concept.is_completed && (
                  <button
                    onClick={() => markAsRead(concept.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Mark as Read
                  </button>
                )}
                {concept.is_completed && (
                  <span className="text-green-600 text-sm font-medium">
                    Completed
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {concepts.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No concepts yet
            </h3>
            <p className="text-gray-600">
              Complete the assessment quiz to get your personalized learning path
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
