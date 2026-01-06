import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, Award, Target, Link as LinkIcon, Edit2, Save, X } from 'lucide-react';

export function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    goal_description: '',
    social_feeds: {
      github: '',
      linkedin: '',
      twitter: '',
      portfolio: '',
    },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        goal_description: profile.goal_description,
        social_feeds: {
          github: profile.social_feeds?.github || '',
          linkedin: profile.social_feeds?.linkedin || '',
          twitter: profile.social_feeds?.twitter || '',
          portfolio: profile.social_feeds?.portfolio || '',
        },
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          name: formData.name,
          goal_description: formData.goal_description,
          social_feeds: formData.social_feeds,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (!error) {
        await refreshProfile();
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        goal_description: profile.goal_description,
        social_feeds: {
          github: profile.social_feeds?.github || '',
          linkedin: profile.social_feeds?.linkedin || '',
          twitter: profile.social_feeds?.twitter || '',
          portfolio: profile.social_feeds?.portfolio || '',
        },
      });
    }
    setEditMode(false);
  };

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="ml-6">
              {editMode ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-3xl font-bold text-gray-800 border-b-2 border-blue-500 focus:outline-none"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
              )}
              <p className="text-gray-600 mt-1">{user?.email}</p>
            </div>
          </div>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <Award className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Learning Level</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {profile.learning_level === 'spoonfeeder'
                ? 'Structured Learning'
                : profile.learning_level === 'well-idea'
                ? 'Advanced Track'
                : 'Not Assessed'}
            </p>
            {!profile.learning_level && (
              <p className="text-sm text-gray-600 mt-2">
                Complete the quiz to determine your learning level
              </p>
            )}
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <Target className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Coding Level</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">Level {profile.coding_level}</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Target className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-800">Goals</h3>
          </div>
          {editMode ? (
            <textarea
              value={formData.goal_description}
              onChange={(e) => setFormData({ ...formData, goal_description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Describe your learning goals..."
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-6">
              {profile.goal_description ? (
                <p className="text-gray-700 leading-relaxed">{profile.goal_description}</p>
              ) : (
                <p className="text-gray-400 italic">No goals set yet</p>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center mb-4">
            <LinkIcon className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-800">Social Links</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['github', 'linkedin', 'twitter', 'portfolio'] as const).map((platform) => (
              <div key={platform}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {platform}
                </label>
                {editMode ? (
                  <input
                    type="url"
                    value={formData.social_feeds[platform]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_feeds: {
                          ...formData.social_feeds,
                          [platform]: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`https://${platform}.com/username`}
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg px-4 py-2">
                    {profile.social_feeds?.[platform] ? (
                      <a
                        href={profile.social_feeds[platform]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 truncate block"
                      >
                        {profile.social_feeds[platform]}
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">Not set</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
