import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from './ThemeToggle';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function AllProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/profiles`);
      setProfiles(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load profiles');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 bg-gray-50 dark:bg-gray-900">
        <ThemeToggle />
        <div className="flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">Loading profiles...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-12 px-4 bg-gray-50 dark:bg-gray-900">
        <ThemeToggle />
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Error</h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50 dark:bg-gray-900">
      <ThemeToggle />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            All Profiles
          </h1>
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Profile
          </Link>
        </div>

        {profiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No profiles found yet.
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Create Your First Profile
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Link
                key={profile.id}
                to={`/u/${profile.slug}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col items-center text-center">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.name}
                      className="w-20 h-20 rounded-full mb-4 object-cover border-4 border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full mb-4 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {profile.name}
                  </h2>
                  
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                    @{profile.slug}
                  </p>
                  
                  {profile.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {profile.bio}
                    </p>
                  )}
                  
                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">
                    {profile.links.length} {profile.links.length === 1 ? 'link' : 'links'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllProfiles;
