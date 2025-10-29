import { SigningStargateClient } from "@cosmjs/stargate";
import { reown } from "./reown";

const RPC = "https://rpc-testnet.kiichain.global:443";

export async function submitScore(score: number) {
  const signer = reown.signer;
  if (!signer) throw new Error("Wallet belum terhubung");

  const client = await SigningStargateClient.connectWithSigner(RPC, signer);
  const [account] = await signer.getAccounts();

  const msg = {
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: {
      fromAddress: account.address,
      toAddress: "kii1leaderboardaddress...", // ganti dgn kontrak leaderboard
      amount: [{ denom: "ukii", amount: String(score) }],
    },
  };

  const fee = {
    amount: [{ denom: "ukii", amount: "2000" }],
    gas: "180000",
  };

  const tx = await client.signAndBroadcast(
    account.address,
    [msg],
    fee,
    `TetrisScore:${score}`
  );

  console.log("✅ Score submitted:", tx.transactionHash);
}
