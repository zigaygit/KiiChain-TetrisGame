import { useState } from 'react';
import { Gamepad2, BarChart3, Info } from 'lucide-react';
import TetrisGame from './components/TetrisGame';
import WalletManager from './components/WalletManager';
import Leaderboard from './components/Leaderboard';
import RewardModal from './components/RewardModal';
import { kiichainService } from './services/kiichainService';
import { KIICHAIN_CONFIG } from './config/kiichain';

type View = 'game' | 'leaderboard' | 'about';

function App() {
  const [currentView, setCurrentView] = useState<View>('game');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [gameKey, setGameKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [lastNftTxHash, setLastNftTxHash] = useState<string | null>(null);
  const [lastScore, setLastScore] = useState(0);

  const handleWalletConnected = (address: string) => {
    setWalletConnected(true);
    setWalletAddress(address);
  };

  const handleGameOver = async (score: number, lines: number, level: number) => {
    if (!walletConnected) {
      alert('Please connect your wallet to submit scores');
      return;
    }

    setIsSubmitting(true);
    setLastScore(score);

    try {
      const txHash = await kiichainService.submitScore(score, lines, level);
      setLastTxHash(txHash);

      let nftHash = null;
      if (score >= KIICHAIN_CONFIG.REWARD_THRESHOLDS.BRONZE) {
        nftHash = await kiichainService.mintRewardNFT(score);
        setLastNftTxHash(nftHash);
      }

      setShowRewardModal(true);
    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Failed to submit score to blockchain. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlayAgain = () => {
    setShowRewardModal(false);
    setGameKey(prev => prev + 1);
    setLastTxHash(null);
    setLastNftTxHash(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Gamepad2 className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Tetris on KiiChain</h1>
          </div>
          <p className="text-gray-400">Play Tetris, earn rewards, and compete on the blockchain</p>
        </header>

        <nav className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setCurrentView('game')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              currentView === 'game'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Gamepad2 className="w-5 h-5" />
            Play
          </button>
          <button
            onClick={() => setCurrentView('leaderboard')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              currentView === 'leaderboard'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Leaderboard
          </button>
          <button
            onClick={() => setCurrentView('about')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              currentView === 'about'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Info className="w-5 h-5" />
            About
          </button>
        </nav>

        <div className="max-w-6xl mx-auto">
          {currentView === 'game' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-gray-800/50 backdrop-blur p-6 rounded-lg border border-gray-700">
                  {!walletConnected ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400 mb-6">Connect your wallet to start playing</p>
                    </div>
                  ) : isSubmitting ? (
                    <div className="text-center py-12">
                      <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-300">Submitting score to blockchain...</p>
                    </div>
                  ) : (
                    <TetrisGame key={gameKey} onGameOver={handleGameOver} />
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <WalletManager onWalletConnected={handleWalletConnected} />

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4">Reward Tiers</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-600 font-semibold">Bronze</span>
                      <span className="text-gray-400">{KIICHAIN_CONFIG.REWARD_THRESHOLDS.BRONZE.toLocaleString()}+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-semibold">Silver</span>
                      <span className="text-gray-400">{KIICHAIN_CONFIG.REWARD_THRESHOLDS.SILVER.toLocaleString()}+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-400 font-semibold">Gold</span>
                      <span className="text-gray-400">{KIICHAIN_CONFIG.REWARD_THRESHOLDS.GOLD.toLocaleString()}+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-semibold">Diamond</span>
                      <span className="text-gray-400">{KIICHAIN_CONFIG.REWARD_THRESHOLDS.DIAMOND.toLocaleString()}+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'leaderboard' && <Leaderboard />}

          {currentView === 'about' && (
            <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">About Tetris on KiiChain</h2>

              <div className="space-y-6 text-gray-300">
                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">How It Works</h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Play classic Tetris and earn points</li>
                    <li>Connect your KiiChain wallet to submit scores</li>
                    <li>Your scores are permanently recorded on the blockchain</li>
                    <li>Earn NFT badges when you reach score milestones</li>
                    <li>Compete with players worldwide on the on-chain leaderboard</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">Technology</h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Built on KiiChain testnet using Cosmos SDK</li>
                    <li>Wallet integration with CosmJS</li>
                    <li>On-chain score verification and storage</li>
                    <li>NFT rewards using transaction memos</li>
                    <li>Real-time leaderboard from blockchain data</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">Getting Started</h3>
                  <ol className="space-y-2 list-decimal list-inside">
                    <li>Create or restore a KiiChain wallet</li>
                    <li>Get test tokens from the KiiChain faucet</li>
                    <li>Play Tetris and achieve high scores</li>
                    <li>Submit your score to the blockchain</li>
                    <li>Earn NFT rewards for reaching milestones</li>
                  </ol>
                </section>

                <section className="bg-blue-500/10 border border-blue-500/30 p-4 rounded">
                  <h3 className="text-xl font-semibold text-blue-400 mb-2">Resources</h3>
                  <ul className="space-y-2">
                    <li>
                      <a href="https://docs.kiiglobal.io" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                        KiiChain Documentation
                      </a>
                    </li>
                    <li>
                      <a href="https://app-testnet.kiichain.io" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                        KiiChain Explorer
                      </a>
                    </li>
                    <li>
                      <span className="text-gray-400">Chain ID: </span>
                      <code className="text-gray-300">{KIICHAIN_CONFIG.CHAIN_ID}</code>
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>

      <RewardModal
        isOpen={showRewardModal}
        onClose={handlePlayAgain}
        score={lastScore}
        txHash={lastTxHash}
        nftTxHash={lastNftTxHash}
      />
    </div>
  );
}

export default App;
