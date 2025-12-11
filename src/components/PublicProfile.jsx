import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from './ThemeToggle';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function PublicProfile() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/profiles/${slug}`);
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.detail || 'Profile not found');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [slug]);

  const handleLinkClick = (index) => {
    window.location.href = `${API_BASE_URL}/r/${slug}/${index}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <ThemeToggle />
      
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-8">
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-gray-200 dark:border-gray-700"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {profile.name}
          </h1>
          {profile.bio && (
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-4">
          {profile.links
            .sort((a, b) => a.position - b.position)
            .map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.position)}
                className="w-full py-4 px-6 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-all hover:shadow-md text-center group"
              >
                <span className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {link.title}
                </span>
                {link.click_count > 0 && (
                  <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {link.click_count} clicks
                  </span>
                )}
              </button>
            ))}
        </div>

        {profile.links.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            No links yet
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicProfile;
