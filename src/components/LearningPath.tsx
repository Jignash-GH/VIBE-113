import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, CheckCircle, Circle, Plus, Loader2, X } from 'lucide-react';

interface Concept {
  id: string;
  concept_name: string;
  concept_description: string;
  is_completed: boolean;
  difficulty_level: string;
  order_index: number;
}

export function LearningPath() {
  const { user, profile } = useAuth();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddConcept, setShowAddConcept] = useState(false);
  const [newConceptName, setNewConceptName] = useState('');
  const [addingConcept, setAddingConcept] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Concept | null>(null);
  const [generatingContent, setGeneratingContent] = useState(false);
  const isModalOpenRef = useRef<boolean>(false);

  // Map profile.learning_level to the new skill_level vocabulary
  const skill_level: 'spoonfeeder' | 'structured' | null =
    profile?.learning_level === 'spoonfeeder'
      ? 'spoonfeeder'
      : profile?.learning_level
      ? 'structured'
      : null;

  useEffect(() => {
    if (user) {
      fetchConcepts();
      addDefaultConceptsIfNeeded();
    }
  }, [user]);

  const addDefaultConceptsIfNeeded = async () => {
    const { data: existingConcepts } = await (supabase as any)
      .from('learning_progress')
      .select('id')
      .eq('user_id', user!.id)
      .limit(1);

    if (!existingConcepts || existingConcepts.length === 0) {
      // Add the fundamental beginner concepts that are already defined in Edge Function
      const defaultConcepts = [
        'Variables and Data Types',
        'Basic Operators', 
        'Conditional Statements (if-else)'
      ];

      for (let i = 0; i < defaultConcepts.length; i++) {
        await addCustomConceptByName(defaultConcepts[i], i);
      }
    }
  };

  const addCustomConceptByName = async (conceptName: string, orderIndex: number) => {
    try {
      // Get current session to include auth token
      const { data: sessionData } = await supabase.auth.getSession();
      
      const payload = {
        topic: conceptName,
        language: localStorage.getItem('programming_language') ?? 'programming',
        skill_level: skill_level ?? 'structured',
      };
      
      const { error } = await supabase.functions.invoke('generate-learning-content', {
        body: payload,
        headers: sessionData?.session?.access_token ? {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        } : undefined,
      });

      if (!error) {
        // Add a small delay to ensure database update
        setTimeout(() => {
          fetchConcepts();
        }, 1000 * (orderIndex + 1)); // Stagger requests
      }
    } catch (error) {
      console.error('Error adding default concept:', error);
    }
  };

  const fetchConcepts = async () => {
    const { data, error } = await (supabase as any)
      .from('learning_progress')
      .select('*')
      .eq('user_id', user!.id)
      .order('order_index', { ascending: true });

    if (!error && data) {
      setConcepts(data);
      // Update selected topic only if modal is still open
      if (selectedTopic && isModalOpenRef.current) {
        const updatedConcept = data.find((c: Concept) => c.id === selectedTopic.id);
        if (updatedConcept) {
          setSelectedTopic(updatedConcept);
        }
      }
    }
    setLoading(false);
  };

  const markAsRead = async (conceptId: string) => {
    const { error } = await (supabase as any)
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
      // Get current session to include auth token
      const { data: sessionData } = await supabase.auth.getSession();
      
      const payload = {
        topic: newConceptName,
        language: localStorage.getItem('programming_language') ?? 'programming',
        skill_level: skill_level ?? 'structured',
      };
      
      const { error } = await supabase.functions.invoke('generate-learning-content', {
        body: payload,
        headers: sessionData?.session?.access_token ? {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        } : undefined,
      });

      if (!error) {
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

  const handleTopicClick = async (concept: Concept) => {
    // First, show modal with existing content
    setSelectedTopic(concept);
    setGeneratingContent(true);
    isModalOpenRef.current = true;

    try {
      // Get current session to include auth token
      const { data: sessionData } = await supabase.auth.getSession();
      
      const payload = {
        topic: concept.concept_name,
        language: localStorage.getItem('programming_language') ?? 'programming',
        skill_level: skill_level ?? 'structured',
      };
      
      const { data, error } = await supabase.functions.invoke('generate-learning-content', {
        body: payload,
        headers: sessionData?.session?.access_token ? {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        } : undefined,
      });
      
      // Only update if the modal is still open (user hasn't closed it)
      if (isModalOpenRef.current) {
        if (!error && data) {
          // Check if description is returned in the response
          const description = data.description;
          
          if (description && typeof description === 'string' && description.length > 50) {
            // Update the selected topic with the new description immediately
            const updatedConcept = {
              ...concept,
              concept_description: description,
            };
            setSelectedTopic(updatedConcept);
            
            // Also update the concept in the concepts list
            setConcepts((prev) =>
              prev.map((c) => (c.id === concept.id ? updatedConcept : c))
            );
          } else {
            // If no description in response, wait a moment then fetch from database
            // (database update might need a moment to propagate)
            setTimeout(async () => {
              if (isModalOpenRef.current) {
                await fetchConcepts();
              }
            }, 500);
          }
        } else if (error) {
          console.error('Error generating content:', error);
          // On error, try to fetch from database in case it was updated
          if (isModalOpenRef.current) {
            await fetchConcepts();
          }
        }
      }
    } catch (e) {
      console.error('Error generating content for topic:', e);
      // On error, still try to fetch updated concepts
      if (isModalOpenRef.current) {
        await fetchConcepts();
      }
    } finally {
      // Only clear loading state if modal is still open
      if (isModalOpenRef.current) {
        setGeneratingContent(false);
      }
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
            {skill_level && (
              <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full border ${
                skill_level === 'spoonfeeder'
                  ? 'bg-green-50 text-green-800 border-green-200'
                  : 'bg-purple-50 text-purple-800 border-purple-200'
              }`}>
                {skill_level === 'spoonfeeder' ? 'Beginner Mode' : 'Fast Track'}
              </span>
            )}
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
                  <h3
                    className="text-xl font-semibold text-gray-800 cursor-pointer hover:underline"
                    title="Click to view detailed explanation"
                    onClick={() => handleTopicClick(concept)}
                  >
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

      {/* Topic Explanation Modal */}
      {selectedTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => {
          isModalOpenRef.current = false;
          setSelectedTopic(null);
          setGeneratingContent(false);
        }}>
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-800">{selectedTopic.concept_name}</h2>
                {selectedTopic.difficulty_level === 'beginner' && (
                  <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                    Beginner
                  </span>
                )}
                {selectedTopic.difficulty_level === 'advanced' && (
                  <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">
                    Advanced
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  isModalOpenRef.current = false;
                  setSelectedTopic(null);
                  setGeneratingContent(false);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {generatingContent ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                  <p className="text-gray-600">
                    {selectedTopic.difficulty_level === 'beginner' 
                      ? 'Generating detailed explanation...' 
                      : 'Generating concise explanation...'}
                  </p>
                </div>
              ) : (
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedTopic.concept_description}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {selectedTopic.difficulty_level === 'beginner' 
                    ? '💡 Detailed explanation with step-by-step guidance' 
                    : '⚡ Concise explanation focusing on core concepts'}
                </p>
                <button
                  onClick={() => {
                    if (!selectedTopic.is_completed) {
                      markAsRead(selectedTopic.id);
                    }
                    setSelectedTopic(null);
                  }}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    selectedTopic.is_completed
                      ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={selectedTopic.is_completed}
                >
                  {selectedTopic.is_completed ? 'Already Completed' : 'Mark as Read'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
