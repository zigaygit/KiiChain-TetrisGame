import { useState, useEffect } from 'react';
import { Wallet, Copy, Check } from 'lucide-react';
import { kiichainService } from '../services/kiichainService';

interface WalletManagerProps {
  onWalletConnected: (address: string) => void;
}

export default function WalletManager({ onWalletConnected }: WalletManagerProps) {
  const [address, setAddress] = useState<string>('');
  const [mnemonic, setMnemonic] = useState<string>('');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreMnemonic, setRestoreMnemonic] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedAddress = localStorage.getItem('kii_wallet_address');
    const savedMnemonic = localStorage.getItem('kii_wallet_mnemonic');

    if (savedAddress && savedMnemonic) {
      setAddress(savedAddress);
      setMnemonic(savedMnemonic);
      restoreWallet(savedMnemonic);
    }
  }, []);

  const restoreWallet = async (mnemonic: string) => {
    try {
      const addr = await kiichainService.restoreWallet(mnemonic);
      await kiichainService.connectClient();
      onWalletConnected(addr);
    } catch (error) {
      console.error('Error restoring wallet:', error);
    }
  };

  const handleCreateWallet = async () => {
    setIsCreating(true);
    try {
      const wallet = await kiichainService.createWallet();
      await kiichainService.connectClient();

      setAddress(wallet.address);
      setMnemonic(wallet.mnemonic);
      setShowMnemonic(true);

      localStorage.setItem('kii_wallet_address', wallet.address);
      localStorage.setItem('kii_wallet_mnemonic', wallet.mnemonic);

      onWalletConnected(wallet.address);
    } catch (error) {
      console.error('Error creating wallet:', error);
      alert('Failed to create wallet. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestoreWallet = async () => {
    if (!restoreMnemonic.trim()) {
      alert('Please enter a valid mnemonic phrase');
      return;
    }

    setIsCreating(true);
    try {
      const addr = await kiichainService.restoreWallet(restoreMnemonic.trim());
      await kiichainService.connectClient();

      setAddress(addr);
      setMnemonic(restoreMnemonic.trim());

      localStorage.setItem('kii_wallet_address', addr);
      localStorage.setItem('kii_wallet_mnemonic', restoreMnemonic.trim());

      onWalletConnected(addr);
      setIsRestoring(false);
      setRestoreMnemonic('');
    } catch (error) {
      console.error('Error restoring wallet:', error);
      alert('Failed to restore wallet. Please check your mnemonic phrase.');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (address && !showMnemonic) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Wallet Connected</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400">Address</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 bg-gray-900 px-3 py-2 rounded text-sm text-gray-300 break-all">
                {address}
              </code>
              <button
                onClick={() => copyToClipboard(address)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>

          <div className="text-xs text-yellow-400 bg-yellow-400/10 p-3 rounded">
            This is a testnet wallet. Get free test tokens from the KiiChain faucet.
          </div>
        </div>
      </div>
    );
  }

  if (showMnemonic) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-yellow-500">
        <h3 className="text-xl font-bold text-white mb-4">Save Your Mnemonic Phrase</h3>

        <div className="space-y-4">
          <div className="bg-yellow-400/10 border border-yellow-400 p-4 rounded">
            <p className="text-yellow-400 text-sm font-semibold mb-2">IMPORTANT: Save this phrase securely!</p>
            <p className="text-gray-300 text-sm">
              This is the only way to recover your wallet. Never share it with anyone.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400">Mnemonic Phrase</label>
              <button
                onClick={() => copyToClipboard(mnemonic)}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="bg-gray-900 p-4 rounded">
              <code className="text-sm text-gray-300 break-all">{mnemonic}</code>
            </div>
          </div>

          <button
            onClick={() => setShowMnemonic(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded transition"
          >
            I Have Saved My Mnemonic
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">Connect Wallet</h3>
      </div>

      {!isRestoring ? (
        <div className="space-y-4">
          <button
            onClick={handleCreateWallet}
            disabled={isCreating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded transition"
          >
            {isCreating ? 'Creating Wallet...' : 'Create New Wallet'}
          </button>

          <button
            onClick={() => setIsRestoring(true)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded transition"
          >
            Restore Existing Wallet
          </button>

          <div className="text-xs text-gray-400 text-center">
            KiiChain Testnet • Get test tokens from the faucet
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Enter Your Mnemonic Phrase</label>
            <textarea
              value={restoreMnemonic}
              onChange={(e) => setRestoreMnemonic(e.target.value)}
              placeholder="Enter your 24-word mnemonic phrase"
              className="w-full bg-gray-900 text-gray-300 px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none min-h-[100px]"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRestoreWallet}
              disabled={isCreating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded transition"
            >
              {isCreating ? 'Restoring...' : 'Restore Wallet'}
            </button>
            <button
              onClick={() => {
                setIsRestoring(false);
                setRestoreMnemonic('');
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
