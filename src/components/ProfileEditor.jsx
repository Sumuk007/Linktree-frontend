import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from './ThemeToggle';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function ProfileEditor() {
  const { slug: urlSlug } = useParams();
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = useState(!!urlSlug);
  
  const [formData, setFormData] = useState({
    slug: urlSlug || '',
    name: '',
    bio: '',
    avatar_url: '',
    theme: 'light',
    password: '',
  });
  
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [createdSlug, setCreatedSlug] = useState(null);
  const [searchSlug, setSearchSlug] = useState('');

  useEffect(() => {
    if (urlSlug) {
      fetchProfile();
    }
  }, [urlSlug]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/profiles/${urlSlug}`);
      const profile = response.data;
      setFormData({
        slug: profile.slug,
        name: profile.name,
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        theme: profile.theme,
        password: '',
      });
      setLinks(profile.links.sort((a, b) => a.position - b.position));
      setIsEdit(true);
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddLink = () => {
    setLinks([
      ...links,
      {
        title: '',
        url: '',
        position: links.length,
      },
    ]);
  };

  const handleLinkChange = (index, field, value) => {
    const updatedLinks = [...links];
    updatedLinks[index][field] = value;
    updatedLinks[index].position = index;
    setLinks(updatedLinks);
  };

  const handleRemoveLink = (index) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    // Reorder positions
    updatedLinks.forEach((link, i) => {
      link.position = i;
    });
    setLinks(updatedLinks);
  };

  const handleMoveLink = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= links.length) return;

    const updatedLinks = [...links];
    [updatedLinks[index], updatedLinks[newIndex]] = [updatedLinks[newIndex], updatedLinks[index]];
    
    // Update positions
    updatedLinks.forEach((link, i) => {
      link.position = i;
    });
    
    setLinks(updatedLinks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate
    if (!formData.slug || !formData.name) {
      setError('Slug and name are required');
      setLoading(false);
      return;
    }

    // Prepare links data (only include non-empty links)
    const validLinks = links.filter(link => link.title && link.url);

    try {
      if (isEdit) {
        // Update existing profile
        await axios.put(`${API_BASE_URL}/api/profiles/${formData.slug}`, {
          name: formData.name,
          bio: formData.bio || null,
          avatar_url: formData.avatar_url || null,
          theme: formData.theme,
          password: formData.password || null,
          links: validLinks,
        });
        setSuccess(true);
      } else {
        // Create new profile
        await axios.post(`${API_BASE_URL}/api/profiles`, {
          ...formData,
          bio: formData.bio || null,
          avatar_url: formData.avatar_url || null,
          password: formData.password || null,
          links: validLinks,
        });
        setSuccess(true);
        setCreatedSlug(formData.slug);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = () => {
    if (searchSlug) {
      navigate(`/u/${searchSlug}`);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50 dark:bg-gray-900">
      <ThemeToggle />
      
      <div className="max-w-3xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            to="/profiles"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            View All Profiles
          </Link>
        </div>
        {/* Search/View Profile Section */}
        {!isEdit && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              View Existing Profile
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchSlug}
                onChange={(e) => setSearchSlug(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleViewProfile()}
                placeholder="Enter profile slug"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleViewProfile}
                disabled={!searchSlug}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                View
              </button>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {isEdit ? 'Edit Profile' : 'Create Profile'}
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 rounded">
              <p className="font-semibold mb-2">Profile saved successfully!</p>
              {createdSlug && (
                <div className="flex gap-2 mt-2">
                  <Link
                    to={`/u/${createdSlug}`}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors inline-block"
                  >
                    View Your Profile
                  </Link>
                  <Link
                    to={`/edit/${createdSlug}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors inline-block"
                  >
                    Edit Profile
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slug (URL) *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                disabled={isEdit}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                placeholder="your-username"
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Your profile will be at: /u/{formData.slug || 'your-username'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Your Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Tell people about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password (optional)
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Leave blank to keep current"
              />
            </div>

            {/* Links Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Links
                </h2>
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Link
                </button>
              </div>

              <div className="space-y-4">
                {links.map((link, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => handleMoveLink(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveLink(index, 'down')}
                        disabled={index === links.length - 1}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(index)}
                        className="ml-auto p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                      className="w-full px-4 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Link Title"
                    />

                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="https://example.com"
                    />
                  </div>
                ))}
              </div>

              {links.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No links yet. Click "Add Link" to get started.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
              >
                {loading ? 'Saving...' : isEdit ? 'Update Profile' : 'Create Profile'}
              </button>
              
              {isEdit && (
                <Link
                  to={`/u/${formData.slug}`}
                  className="py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-center"
                >
                  View Profile
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileEditor;
