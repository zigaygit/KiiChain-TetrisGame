"use client";
import React, { useEffect, useState } from "react";
import { useAppKit } from "@reown/appkit/react";
import { reown } from "../utils/reown";

type Props = {
  onWalletConnected: (address: string) => void;
};

export default function WalletManager({ onWalletConnected }: Props) {
  const { connect, disconnect, connected, address } = useAppKit();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (connected && address) onWalletConnected(address);
  }, [connected, address]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
      <h3 className="text-lg font-bold text-white mb-3">Wallet Connection</h3>

      {connected ? (
        <>
          <p className="text-green-400 text-sm mb-3">✅ Connected: {address}</p>
          <button
            onClick={disconnect}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={async () => {
            setIsConnecting(true);
            try {
              await connect();
            } finally {
              setIsConnecting(false);
            }
          }}
          disabled={isConnecting}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white disabled:opacity-50"
        >
          {isConnecting ? "Connecting..." : "Connect Wallet via Reown"}
        </button>
      )}
    </div>
  );
}
