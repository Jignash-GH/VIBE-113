import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LearningPath } from './LearningPath';
import { CodingPlatforms } from './CodingPlatforms';
import { Profile } from './Profile';
import { BookOpen, Code, User, LogOut, GraduationCap } from 'lucide-react';
import { HelpToggle } from './HelpToggle';
import { Explain } from './Explain';

type Tab = 'overview' | 'learning' | 'platforms' | 'profile';

export function Home() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="w-8 h-8 text-blue-600 mr-3" />
              <span className="text-2xl font-bold text-gray-800">Acharya</span>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('learning')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'learning'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Learning Path
              </button>
              <button
                onClick={() => setActiveTab('platforms')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'platforms'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Code className="w-4 h-4 mr-2" />
                Coding Platforms
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <HelpToggle />
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{profile?.name}</p>
                <p className="text-xs text-gray-600">
                  {profile?.learning_level === 'spoonfeeder'
                    ? 'Structured Learning'
                    : profile?.learning_level === 'well-idea'
                    ? 'Advanced Track'
                    : 'Level ' + profile?.coding_level}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">Welcome back, {profile?.name}!</h1>
              <p className="text-blue-100 text-lg">
                Continue your personalized coding journey
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Concept explanations</h3>
              <Explain
                className="text-gray-700"
                beginner={
                  <p>
                    You are viewing <span className="font-semibold">Beginner</span> explanations. We’ll break ideas down with simple definitions, analogies, and step-by-step guidance.
                  </p>
                }
                advanced={
                  <p>
                    You are viewing <span className="font-semibold">Advanced</span> explanations. We’ll focus on core principles, trade-offs, and implementation details without step-by-step handholding.
                  </p>
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setActiveTab('learning')}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-left group"
              >
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Learning Path</h3>
                <p className="text-gray-600">
                  Follow your personalized curriculum based on your skill level
                </p>
              </button>

              <button
                onClick={() => setActiveTab('platforms')}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-left group"
              >
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <Code className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Coding Platforms</h3>
                <p className="text-gray-600">
                  Track your progress on CodeChef and LeetCode
                </p>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-left group"
              >
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Profile</h3>
                <p className="text-gray-600">
                  Manage your profile, goals, and social links
                </p>
              </button>
            </div>

            {profile?.learning_level && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Learning Journey</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Learning Level</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {profile.learning_level === 'spoonfeeder'
                        ? 'Structured Learning'
                        : 'Advanced Track'}
                    </p>
                    <p className="text-gray-600 mt-2">
                      {profile.learning_level === 'spoonfeeder'
                        ? 'Detailed explanations and step-by-step guidance'
                        : 'Advanced concepts and problem-solving techniques'}
                    </p>
                  </div>
                  {profile.goal_description && (
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-2">Your Goal</h3>
                      <p className="text-gray-700 leading-relaxed">{profile.goal_description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'learning' && <LearningPath />}
        {activeTab === 'platforms' && <CodingPlatforms />}
        {activeTab === 'profile' && <Profile />}
      </main>
    </div>
  );
}
