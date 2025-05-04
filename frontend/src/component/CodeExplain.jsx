import React, { useState } from 'react';
import axios from 'axios';

const CodeExplain = ({ code }) => {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    setLoading(true);
    setExplanation('');

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Explain the following code in simple language:\n\n${code}`,
                },
              ],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      setExplanation(result || 'No explanation returned.');
    } catch (err) {
      console.error('Gemini API error:', err);
      setExplanation('Error fetching explanation.');
    }

    setLoading(false);
  };

  return (
    <div className="p-4 border rounded shadow-md bg-white max-w-xl">
      <button
        onClick={handleExplain}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Explaining...' : 'Explain Code'}
      </button>

      {explanation && (
        <div className="mt-4 text-gray-800">
          <strong>Explanation:</strong>
          <p className="mt-2 whitespace-pre-wrap">{explanation}</p>
        </div>
      )}
    </div>
  );
};

export default CodeExplain;
