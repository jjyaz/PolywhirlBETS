import { useState } from 'react';
import { User } from '../lib/supabase';
import { Edit3, Save, X, Upload } from 'lucide-react';

interface ProfileEditProps {
  user: User;
  onUpdate: (username?: string, profilePictureUrl?: string) => Promise<{ success: boolean; error?: string }>;
}

export const ProfileEdit = ({ user, onUpdate }: ProfileEditProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user.username || '');
  const [profilePictureUrl, setProfilePictureUrl] = useState(user.profile_picture_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setError('');

    const result = await onUpdate(
      username.trim() || undefined,
      profilePictureUrl.trim() || undefined
    );

    setIsSaving(false);

    if (result.success) {
      setIsEditing(false);
    } else {
      setError(result.error || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setUsername(user.username || '');
    setProfilePictureUrl(user.profile_picture_url || '');
    setError('');
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-mono text-white font-bold tracking-wide text-lg">USER_PROFILE.dat</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-transparent hover:bg-white/10 text-white px-4 py-2 font-mono text-sm border border-gray-700 hover:border-white transition-all flex items-center gap-2"
          >
            <Edit3 size={16} />
            EDIT
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full border-4 border-gray-700 overflow-hidden bg-gray-800 flex items-center justify-center">
            {user.profile_picture_url ? (
              <img
                src={user.profile_picture_url}
                alt={user.username || 'Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl text-gray-600">👤</span>
            )}
          </div>

          <div>
            <p className="font-mono text-gray-500 text-xs mb-1">&gt; USERNAME:</p>
            <p className="font-mono text-white text-xl font-bold mb-3">
              {user.username || 'ANONYMOUS_USER'}
            </p>
            <p className="font-mono text-gray-600 text-xs break-all">
              {user.wallet_address.slice(0, 8)}...{user.wallet_address.slice(-8)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-mono text-white font-bold tracking-wide text-lg">EDIT_PROFILE.exe</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="bg-transparent hover:bg-red-900/30 text-gray-400 hover:text-white px-4 py-2 font-mono text-sm border border-gray-700 hover:border-red-500 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <X size={16} />
            CANCEL
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-white hover:bg-gray-200 text-black px-4 py-2 font-mono text-sm border-2 border-white transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'SAVING...' : 'SAVE'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500 text-red-400 font-mono text-sm">
          &gt; ERROR: {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="font-mono text-gray-400 text-sm block mb-2">
            &gt; PROFILE_PICTURE_URL:
          </label>
          <div className="flex gap-3 items-start">
            <div className="w-24 h-24 rounded-full border-4 border-gray-700 overflow-hidden bg-gray-800 flex items-center justify-center flex-shrink-0">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <Upload size={32} className="text-gray-600" />
              )}
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={profilePictureUrl}
                onChange={(e) => setProfilePictureUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-black border-2 border-gray-700 focus:border-white text-white font-mono text-sm px-4 py-2 outline-none transition-all"
              />
              <p className="font-mono text-gray-600 text-xs mt-2">
                // PASTE_IMAGE_URL_OR_LEAVE_BLANK
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="font-mono text-gray-400 text-sm block mb-2">
            &gt; USERNAME:
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            maxLength={50}
            className="w-full bg-black border-2 border-gray-700 focus:border-white text-white font-mono text-sm px-4 py-2 outline-none transition-all"
          />
          <p className="font-mono text-gray-600 text-xs mt-2">
            // MAX_50_CHARACTERS
          </p>
        </div>
      </div>
    </div>
  );
};
