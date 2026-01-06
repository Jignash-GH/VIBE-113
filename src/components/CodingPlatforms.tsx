import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Code, Trophy, Target, Plus, Edit2, Loader2 } from 'lucide-react';

interface Platform {
  id: string;
  platform: 'codechef' | 'leetcode';
  username: string;
  contest_rank: number;
  star_rating: number;
  current_division: string;
  goal: string;
}

export function CodingPlatforms() {
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    platform: 'codechef' as 'codechef' | 'leetcode',
    username: '',
    contest_rank: 0,
    star_rating: 0,
    current_division: '',
  });

  useEffect(() => {
    if (user) {
      fetchPlatforms();
    }
  }, [user]);

  const fetchPlatforms = async () => {
    const { data, error } = await supabase
      .from('coding_platforms')
      .select('*')
      .eq('user_id', user!.id);

    if (!error && data) {
      setPlatforms(data);
    }
    setLoading(false);
  };

  const generateGoal = (platform: 'codechef' | 'leetcode', starRating: number) => {
    if (platform === 'codechef') {
      if (starRating === 0) return 'Achieve 1-star rating';
      if (starRating < 3) return `Reach ${starRating + 1}-star rating`;
      if (starRating < 5) return 'Become a 5-star coder';
      return 'Achieve 6-star rating';
    } else {
      return 'Improve contest ranking and solve more problems';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const goal = generateGoal(formData.platform, formData.star_rating);

    if (editMode) {
      const { error } = await (supabase as any)
        .from('coding_platforms')
        .update({
          username: formData.username,
          contest_rank: formData.contest_rank,
          star_rating: formData.star_rating,
          current_division: formData.current_division,
          goal,
          last_updated: new Date().toISOString(),
        })
        .eq('id', editMode);

      if (!error) {
        await fetchPlatforms();
        setEditMode(null);
        resetForm();
      }
    } else {
      const { error } = await (supabase as any).from('coding_platforms').insert({
        user_id: user!.id,
        platform: formData.platform,
        username: formData.username,
        contest_rank: formData.contest_rank,
        star_rating: formData.star_rating,
        current_division: formData.current_division,
        goal,
      });

      if (!error) {
        await fetchPlatforms();
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      platform: 'codechef',
      username: '',
      contest_rank: 0,
      star_rating: 0,
      current_division: '',
    });
  };

  const startEdit = (platform: Platform) => {
    setEditMode(platform.id);
    setFormData({
      platform: platform.platform,
      username: platform.username,
      contest_rank: platform.contest_rank,
      star_rating: platform.star_rating,
      current_division: platform.current_division,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const hasCodeChef = platforms.some((p) => p.platform === 'codechef');
  const hasLeetCode = platforms.some((p) => p.platform === 'leetcode');
  const canAddNew = !hasCodeChef || !hasLeetCode;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Code className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Coding Platforms</h2>
          </div>
          {canAddNew && !editMode && (
            <button
              onClick={() => {
                resetForm();
                if (!hasCodeChef) setFormData((prev) => ({ ...prev, platform: 'codechef' }));
                else setFormData((prev) => ({ ...prev, platform: 'leetcode' }));
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Platform
            </button>
          )}
        </div>

        {(canAddNew || editMode) && (
          <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              {editMode ? 'Edit Platform Stats' : 'Add Platform Stats'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) =>
                    setFormData({ ...formData, platform: e.target.value as 'codechef' | 'leetcode' })
                  }
                  disabled={!!editMode}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="codechef" disabled={hasCodeChef && !editMode}>
                    CodeChef
                  </option>
                  <option value="leetcode" disabled={hasLeetCode && !editMode}>
                    LeetCode
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contest Rank
                </label>
                <input
                  type="number"
                  value={formData.contest_rank}
                  onChange={(e) => setFormData({ ...formData, contest_rank: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {formData.platform === 'codechef' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Star Rating
                    </label>
                    <input
                      type="number"
                      value={formData.star_rating}
                      onChange={(e) =>
                        setFormData({ ...formData, star_rating: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="7"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Division
                    </label>
                    <select
                      value={formData.current_division}
                      onChange={(e) => setFormData({ ...formData, current_division: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Division</option>
                      <option value="Div 4">Division 4</option>
                      <option value="Div 3">Division 3</option>
                      <option value="Div 2">Division 2</option>
                      <option value="Div 1">Division 1</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editMode ? 'Update' : 'Add'}
              </button>
              {editMode && (
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => (
          <div key={platform.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  platform.platform === 'codechef' ? 'bg-orange-100' : 'bg-yellow-100'
                }`}>
                  <Code className={`w-6 h-6 ${
                    platform.platform === 'codechef' ? 'text-orange-600' : 'text-yellow-600'
                  }`} />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-bold text-gray-800 capitalize">
                    {platform.platform}
                  </h3>
                  <p className="text-sm text-gray-600">{platform.username}</p>
                </div>
              </div>
              <button
                onClick={() => startEdit(platform)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Trophy className="w-5 h-5 mr-2" />
                  <span className="text-sm">Contest Rank</span>
                </div>
                <span className="font-semibold text-gray-800">
                  {platform.contest_rank > 0 ? `#${platform.contest_rank}` : 'Not set'}
                </span>
              </div>

              {platform.platform === 'codechef' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Star Rating</span>
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-800 mr-1">
                        {platform.star_rating}
                      </span>
                      <span className="text-yellow-500">★</span>
                    </div>
                  </div>
                  {platform.current_division && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Division</span>
                      <span className="font-semibold text-gray-800">
                        {platform.current_division}
                      </span>
                    </div>
                  )}
                </>
              )}

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-start">
                  <Target className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Goal</p>
                    <p className="text-sm font-semibold text-gray-800">{platform.goal}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {platforms.length === 0 && (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
            <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No platforms added yet
            </h3>
            <p className="text-gray-600">
              Add your CodeChef or LeetCode profile to track your progress
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
