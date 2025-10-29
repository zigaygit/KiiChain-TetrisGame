import { Award, X, ExternalLink } from 'lucide-react';
import { KIICHAIN_CONFIG } from '../config/kiichain';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  txHash: string | null;
  nftTxHash: string | null;
}

export default function RewardModal({ isOpen, onClose, score, txHash, nftTxHash }: RewardModalProps) {
  if (!isOpen) return null;

  const getRewardTier = () => {
    if (score >= KIICHAIN_CONFIG.REWARD_THRESHOLDS.DIAMOND) return 'DIAMOND';
    if (score >= KIICHAIN_CONFIG.REWARD_THRESHOLDS.GOLD) return 'GOLD';
    if (score >= KIICHAIN_CONFIG.REWARD_THRESHOLDS.SILVER) return 'SILVER';
    if (score >= KIICHAIN_CONFIG.REWARD_THRESHOLDS.BRONZE) return 'BRONZE';
    return null;
  };

  const tier = getRewardTier();

  const getTierColor = () => {
    switch (tier) {
      case 'DIAMOND': return 'from-cyan-400 to-blue-600';
      case 'GOLD': return 'from-yellow-400 to-yellow-600';
      case 'SILVER': return 'from-gray-300 to-gray-500';
      case 'BRONZE': return 'from-amber-600 to-amber-800';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className={`mx-auto w-24 h-24 rounded-full bg-gradient-to-br ${getTierColor()} flex items-center justify-center mb-4`}>
            <Award className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {tier ? 'Congratulations!' : 'Score Submitted!'}
          </h2>

          <p className="text-gray-300 mb-6">
            Your score of <span className="font-bold text-white">{score.toLocaleString()}</span> has been recorded on the blockchain!
          </p>

          {tier && (
            <div className={`bg-gradient-to-r ${getTierColor()} p-4 rounded-lg mb-6`}>
              <div className="text-white font-bold text-lg mb-1">
                {tier} BADGE EARNED
              </div>
              <div className="text-white/90 text-sm">
                NFT Reward Minted
              </div>
            </div>
          )}

          <div className="space-y-3 text-left bg-gray-900 p-4 rounded-lg mb-6">
            {txHash && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Score Transaction</div>
                <a
                  href={`https://app-testnet.kiichain.io/kiitestnet-2/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm break-all"
                >
                  <span className="truncate">{txHash}</span>
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>
            )}

            {nftTxHash && (
              <div>
                <div className="text-xs text-gray-400 mb-1">NFT Mint Transaction</div>
                <a
                  href={`https://app-testnet.kiichain.io/kiitestnet-2/tx/${nftTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm break-all"
                >
                  <span className="truncate">{nftTxHash}</span>
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded transition"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
