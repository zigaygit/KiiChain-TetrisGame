import React from "react";
import { useAppKit } from "@reown/appkit/react";
import { reown } from "../utils/reown";

export default function ConnectWallet() {
  const { connect, disconnect, connected, address } = useAppKit();

  return (
    <div className="text-center p-4">
      {connected ? (
        <div>
          <p className="text-green-500">Connected: {address}</p>
          <button
            onClick={disconnect}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mt-2"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connect}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Connect Wallet via Reown
        </button>
      )}
    </div>
  );
}
