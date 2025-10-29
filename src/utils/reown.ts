import { createAppKit } from "@reown/appkit";

export const reown = createAppKit({
  projectId: "8f6059b98b9e86b3a45ac9a61f396e99", // ID project dari dashboard reown
  chains: ["kiichain-testnet"],
  metadata: {
    name: "KiiChain Tetris",
    description: "Play Tetris, earn NFT on KiiChain",
    url: "https://codesandbox.io",
  },
});
