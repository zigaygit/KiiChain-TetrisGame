import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningStargateClient, StargateClient } from '@cosmjs/stargate';
import { KIICHAIN_CONFIG } from '../config/kiichain';

export interface WalletInfo {
  address: string;
  mnemonic: string;
}

class KiiChainService {
  private wallet: DirectSecp256k1HdWallet | null = null;
  private client: SigningStargateClient | null = null;
  private queryClient: StargateClient | null = null;

  async createWallet(): Promise<WalletInfo> {
    const wallet = await DirectSecp256k1HdWallet.generate(24, {
      prefix: KIICHAIN_CONFIG.PREFIX,
    });

    const [account] = await wallet.getAccounts();

    this.wallet = wallet;

    return {
      address: account.address,
      mnemonic: wallet.mnemonic,
    };
  }

  async restoreWallet(mnemonic: string): Promise<string> {
    this.wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: KIICHAIN_CONFIG.PREFIX,
    });

    const [account] = await this.wallet.getAccounts();
    return account.address;
  }

  async connectClient(): Promise<void> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    this.client = await SigningStargateClient.connectWithSigner(
      KIICHAIN_CONFIG.TESTNET_RPC,
      this.wallet,
      {
        gasPrice: {
          amount: KIICHAIN_CONFIG.GAS_PRICE,
          denom: KIICHAIN_CONFIG.DENOM,
        } as any,
      }
    );

    this.queryClient = await StargateClient.connect(KIICHAIN_CONFIG.TESTNET_RPC);
  }

  async submitScore(score: number, lines: number, level: number): Promise<string> {
    if (!this.client || !this.wallet) {
      throw new Error('Client not connected');
    }

    const [account] = await this.wallet.getAccounts();

    const memo = JSON.stringify({
      type: 'tetris_score',
      score,
      lines,
      level,
      timestamp: new Date().toISOString(),
    });

    const amount = [{
      denom: KIICHAIN_CONFIG.DENOM,
      amount: '1',
    }];

    const result = await this.client.sendTokens(
      account.address,
      account.address,
      amount,
      'auto',
      memo
    );

    return result.transactionHash;
  }

  async getLeaderboard(): Promise<any[]> {
    if (!this.queryClient) {
      await this.connectQueryClient();
    }

    try {
      const response = await fetch(
        `${KIICHAIN_CONFIG.TESTNET_API}/cosmos/tx/v1beta1/txs?events=message.sender='${KIICHAIN_CONFIG.PREFIX}'&order_by=ORDER_BY_DESC&limit=50`
      );

      const data = await response.json();

      const scores = data.txs
        ?.filter((tx: any) => {
          try {
            const memo = tx.body?.memo;
            if (!memo) return false;
            const parsed = JSON.parse(memo);
            return parsed.type === 'tetris_score';
          } catch {
            return false;
          }
        })
        .map((tx: any) => {
          const memo = JSON.parse(tx.body.memo);
          return {
            address: tx.body.messages[0]?.from_address || 'unknown',
            score: memo.score,
            lines: memo.lines,
            level: memo.level,
            timestamp: memo.timestamp,
            txHash: tx.txhash,
          };
        })
        .sort((a: any, b: any) => b.score - a.score) || [];

      return scores;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  async connectQueryClient(): Promise<void> {
    this.queryClient = await StargateClient.connect(KIICHAIN_CONFIG.TESTNET_RPC);
  }

  async getBalance(address: string): Promise<string> {
    if (!this.queryClient) {
      await this.connectQueryClient();
    }

    try {
      const balance = await this.queryClient.getBalance(
        address,
        KIICHAIN_CONFIG.DENOM
      );
      return balance.amount;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  }

  async mintRewardNFT(score: number): Promise<string | null> {
    if (!this.client || !this.wallet) {
      throw new Error('Client not connected');
    }

    const [account] = await this.wallet.getAccounts();

    let rewardTier = 'BRONZE';
    if (score >= KIICHAIN_CONFIG.REWARD_THRESHOLDS.DIAMOND) {
      rewardTier = 'DIAMOND';
    } else if (score >= KIICHAIN_CONFIG.REWARD_THRESHOLDS.GOLD) {
      rewardTier = 'GOLD';
    } else if (score >= KIICHAIN_CONFIG.REWARD_THRESHOLDS.SILVER) {
      rewardTier = 'SILVER';
    }

    const memo = JSON.stringify({
      type: 'tetris_nft_reward',
      tier: rewardTier,
      score,
      timestamp: new Date().toISOString(),
    });

    const amount = [{
      denom: KIICHAIN_CONFIG.DENOM,
      amount: '1',
    }];

    try {
      const result = await this.client.sendTokens(
        account.address,
        account.address,
        amount,
        'auto',
        memo
      );

      return result.transactionHash;
    } catch (error) {
      console.error('Error minting NFT:', error);
      return null;
    }
  }

  getAddress(): string | null {
    return this.wallet ? 'wallet-address' : null;
  }
}

export const kiichainService = new KiiChainService();
