import { useState, useEffect } from 'react';
import { Trophy, RefreshCw, ExternalLink } from 'lucide-react';
import { kiichainService } from '../services/kiichainService';
import { LeaderboardEntry } from '../types/tetris';

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const loadLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await kiichainService.getLeaderboard();
      setEntries(data);
    } catch (err) {
      setError('Failed to load leaderboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const formatAddress = (address: string) => {
    if (!address || address === 'unknown') return 'Unknown';
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown';
    }
  };

  const getTrophyColor = (index: number) => {
    if (index === 0) return 'text-yellow-400';
    if (index === 1) return 'text-gray-400';
    if (index === 2) return 'text-amber-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Leaderboard</h3>
        </div>
        <button
          onClick={loadLeaderboard}
          disabled={loading}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white px-3 py-2 rounded transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading && entries.length === 0 ? (
        <div className="text-center text-gray-400 py-8">Loading leaderboard...</div>
      ) : error ? (
        <div className="text-center text-red-400 py-8">{error}</div>
      ) : entries.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <p>No scores recorded yet.</p>
          <p className="text-sm mt-2">Be the first to submit a score!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={`${entry.address}-${entry.timestamp}-${index}`}
              className="bg-gray-900 p-4 rounded-lg flex items-center justify-between hover:bg-gray-850 transition"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center justify-center w-8">
                  {index < 3 ? (
                    <Trophy className={`w-5 h-5 ${getTrophyColor(index)}`} />
                  ) : (
                    <span className="text-gray-500 font-semibold">{index + 1}</span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-gray-300">{formatAddress(entry.address)}</code>
                    {entry.txHash && (
                      <a
                        href={`https://app-testnet.kiichain.io/kiitestnet-2/tx/${entry.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{formatDate(entry.timestamp)}</div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-white">{entry.score.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">
                    {entry.lines} lines • Lv {entry.level}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        Scores are stored on KiiChain testnet blockchain
      </div>
    </div>
  );
}
