import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/wallet';

const NomineeManager = ({ user }) => {
  const [nomineeEmail, setNomineeEmail] = useState('');
  const [nomineeAddress, setNomineeAddress] = useState('');
  const [sharePercentage, setSharePercentage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [nomineeData, setNomineeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch nominee data on mount and after save
  useEffect(() => {
    const fetchNominee = async () => {
      setIsLoading(true);
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('nominee_data')
        .eq('id', user.id)
        .single();
      if (!error && data && Array.isArray(data.nominee_data)) {
        setNomineeData(data.nominee_data);
      } else if (!error && data && data.nominee_data) {
        // If it's a single object (legacy), convert to array
        setNomineeData([data.nominee_data]);
      } else {
        setNomineeData([]);
      }
      setIsLoading(false);
    };
    fetchNominee();
  }, [user, showModal]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    // Basic validation
    if (!nomineeEmail || !nomineeAddress || !sharePercentage) {
      setError('All fields are required.');
      setIsSaving(false);
      return;
    }
    const share = parseInt(sharePercentage);
    if (isNaN(share) || share <= 0 || share > 100) {
      setError('Share percentage must be a number between 1 and 100.');
      setIsSaving(false);
      return;
    }

    try {
      // Get current nominees
      let currentNominees = Array.isArray(nomineeData) ? [...nomineeData] : [];
      // Add new nominee
      currentNominees.push({
        email: nomineeEmail,
        address: nomineeAddress,
        share: share,
      });
      const { error: supabaseError } = await supabase
        .from('profiles')
        .update({ nominee_data: currentNominees })
        .eq('id', user.id);
      if (supabaseError) {
        throw supabaseError;
      }
      setShowModal(true);
      setNomineeEmail('');
      setNomineeAddress('');
      setSharePercentage('');
    } catch (err) {
      setError('Failed to save nominee. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="neumorphic-inset rounded-2xl p-6">
      {/* Display all nominees if present */}
      {isLoading ? (
        <div className="mb-4 text-gray-500">Loading nominee details...</div>
      ) : nomineeData && nomineeData.length > 0 ? (
        <div className="mb-4 p-4 bg-gray-100 rounded-xl">
          <div className="font-semibold mb-2">Your Nominees:</div>
          <table className="w-full text-left mb-2">
            <thead>
              <tr>
                <th className="pr-4">Email</th>
                <th className="pr-4">Wallet Address</th>
                <th className="pr-4">Share (%)</th>
              </tr>
            </thead>
            <tbody>
              {nomineeData.map((nom, idx) => (
                <tr key={idx} className="border-t">
                  <td className="pr-4 py-1">{nom.email}</td>
                  <td className="pr-4 py-1">{nom.address}</td>
                  <td className="pr-4 py-1">{nom.share}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mb-4 text-gray-500">No nominees added yet.</div>
      )}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="nomineeEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Nominee's Email Address
          </label>
          <input
            id="nomineeEmail"
            type="email"
            value={nomineeEmail}
            onChange={(e) => setNomineeEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            placeholder="nominee@example.com"
            required
            disabled={isSaving}
          />
        </div>
        <div>
          <label htmlFor="nomineeAddress" className="block text-sm font-medium text-gray-700 mb-2">
            Nominee's Wallet Address
          </label>
          <input
            id="nomineeAddress"
            type="text"
            value={nomineeAddress}
            onChange={(e) => setNomineeAddress(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            placeholder="0x..."
            required
            disabled={isSaving}
          />
        </div>
        <div>
          <label htmlFor="sharePercentage" className="block text-sm font-medium text-gray-700 mb-2">
            Share Percentage (1-100)
          </label>
          <input
            id="sharePercentage"
            type="number"
            value={sharePercentage}
            onChange={(e) => setSharePercentage(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            placeholder="e.g., 50 for 50%"
            required
            min="1"
            max="100"
            disabled={isSaving}
          />
        </div>
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        <button
          type="submit"
          className={`w-full flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-accent hover:bg-accent/90 text-white'
          }`}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Nominee'}
        </button>
      </form>
      {/* Modal Confirmation */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-4">Nominee Added!</h2>
            <p className="mb-6">Nominee details have been saved successfully.</p>
            <button
              className="px-6 py-2 bg-accent text-white rounded-xl font-semibold"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NomineeManager;
