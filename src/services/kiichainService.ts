import { SigningStargateClient } from "@cosmjs/stargate";
import { reown } from "../utils/reown";
import { KIICHAIN_CONFIG } from "../config/kiichain";

/**
 * Service untuk mengirim skor dan NFT reward ke jaringan KiiChain.
 * Menggunakan Reown signer untuk autentikasi wallet.
 */

const RPC = KIICHAIN_CONFIG.RPC_URL;

export const kiichainService = {
  /**
   * Kirim skor Tetris ke smart contract leaderboard.
   */
  async submitScore(score: number, lines: number, level: number) {
    const signer = reown.signer;
    if (!signer) throw new Error("Wallet belum terhubung");

    const client = await SigningStargateClient.connectWithSigner(RPC, signer);
    const [account] = await signer.getAccounts();

    const msg = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: {
        fromAddress: account.address,
        toAddress: KIICHAIN_CONFIG.LEADERBOARD_ADDRESS,
        amount: [{ denom: "ukii", amount: String(score) }],
      },
    };

    const fee = {
      amount: [{ denom: "ukii", amount: "2000" }],
      gas: "180000",
    };

    const result = await client.signAndBroadcast(
      account.address,
      [msg],
      fee,
      `Tetris score: ${score} (lines=${lines}, level=${level})`
    );

    console.log("✅ Score submitted:", result.transactionHash);
    return result.transactionHash;
  },

  /**
   * Mint NFT reward berdasarkan skor pemain.
   */
  async mintRewardNFT(score: number) {
    const signer = reown.signer;
    if (!signer) throw new Error("Wallet belum terhubung");

    const client = await SigningStargateClient.connectWithSigner(RPC, signer);
    const [account] = await signer.getAccounts();

    const msg = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: {
        fromAddress: account.address,
        toAddress: KIICHAIN_CONFIG.REWARD_CONTRACT,
        amount: [{ denom: "ukii", amount: "1" }],
      },
    };

    const fee = {
      amount: [{ denom: "ukii", amount: "2000" }],
      gas: "180000",
    };

    const result = await client.signAndBroadcast(
      account.address,
      [msg],
      fee,
      `NFT reward for score ${score}`
    );

    console.log("🎁 NFT minted:", result.transactionHash);
    return result.transactionHash;
  },
};
