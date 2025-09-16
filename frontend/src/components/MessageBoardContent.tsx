"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Buffer } from "buffer";

// Buffer polyfill only (setImmediate handled in app/polyfills.ts)
if (typeof window !== "undefined") {
  if (!window.Buffer) {
    window.Buffer = Buffer;
  }
}

// Contract configuration
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "ST3D86ZD0YNZ690B7YJ8F9M01G0PK3B46G7S9XH3F";
const CONTRACT_NAME =
  process.env.NEXT_PUBLIC_CONTRACT_NAME || "message-board-v2";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "MessageBoard DApp";

// Types - simplified to avoid complex Stacks type conflicts
interface StacksModules {
  AppConfig: any;
  UserSession: any;
  authenticate: any;
  openContractCall: any;
  STACKS_TESTNET: any;
  fetchCallReadOnlyFunction: any;
  stringUtf8CV: any;
  cvToString: any;
}

export default function MessageBoardContent() {
  const [message, setMessage] = useState("");
  const [myMessage, setMyMessage] = useState(
    "No message found. Send your first message to the blockchain!"
  );
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState("");
  const [stacksModules, setStacksModules] = useState<StacksModules | null>(
    null
  );
  const [userSession, setUserSession] = useState<any>(null);
  const [loadingError, setLoadingError] = useState<string>("");

  // Load Stacks modules dynamically
  const loadStacksModules = useCallback(async () => {
    if (typeof window === "undefined") return null;

    try {
      setLoadingError("");

      const [
        { AppConfig, UserSession, authenticate, openContractCall },
        { STACKS_TESTNET },
        { fetchCallReadOnlyFunction, stringUtf8CV, cvToString },
      ] = await Promise.all([
        import("@stacks/connect").catch((err) => {
          console.error("Failed to load @stacks/connect:", err);
          throw new Error("Failed to load wallet connection module");
        }),
        import("@stacks/network").catch((err) => {
          console.error("Failed to load @stacks/network:", err);
          throw new Error("Failed to load network module");
        }),
        import("@stacks/transactions").catch((err) => {
          console.error("Failed to load @stacks/transactions:", err);
          throw new Error("Failed to load transactions module");
        }),
      ]);

      const modules = {
        AppConfig,
        UserSession,
        authenticate,
        openContractCall,
        STACKS_TESTNET,
        fetchCallReadOnlyFunction,
        stringUtf8CV,
        cvToString,
      };

      setStacksModules(modules);

      // Initialize user session
      const appConfig = new AppConfig(["store_write", "publish_data"]);
      const session = new UserSession({ appConfig });
      setUserSession(session);

      return { modules, session };
    } catch (error) {
      console.error("Failed to load Stacks modules:", error);
      setLoadingError(
        error instanceof Error
          ? error.message
          : "Failed to load required modules"
      );
      return null;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const result = await loadStacksModules();
      if (!result || !mounted) return;

      const { session } = result;

      try {
        if (session.isSignInPending()) {
          const userData = await session.handlePendingSignIn();
          if (mounted) {
            setIsConnected(true);
            setUserAddress(userData.profile.stxAddress.testnet);
          }
        } else if (session.isUserSignedIn()) {
          const userData = session.loadUserData();
          if (mounted) {
            setIsConnected(true);
            setUserAddress(userData.profile.stxAddress.testnet);
          }
        }
      } catch (error) {
        console.error("Error initializing user session:", error);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [loadStacksModules]);

  const connectWallet = useCallback(async () => {
    if (!stacksModules || !userSession) {
      await loadStacksModules();
      return;
    }

    try {
      await stacksModules.authenticate({
        appDetails: {
          name: APP_NAME,
          icon: window.location.origin + "/favicon.ico",
        },
        onFinish: () => {
          setTimeout(() => window.location.reload(), 1000);
        },
        onCancel: () => {
          console.log("User cancelled authentication");
        },
        userSession,
      });
    } catch (error) {
      console.error("Error authenticating:", error);
      alert(
        "Connection error. Please make sure Leather Wallet is installed and try again."
      );
    }
  }, [stacksModules, userSession, loadStacksModules]);

  const disconnectWallet = useCallback(() => {
    if (userSession) {
      userSession.signUserOut();
      setIsConnected(false);
      setUserAddress("");
      setMyMessage(
        "No message found. Send your first message to the blockchain!"
      );
      setTxId("");
    }
  }, [userSession]);

  const fetchMyMessage = useCallback(async () => {
    if (!isConnected || !stacksModules || !userAddress) return;

    setIsLoading(true);
    try {
      const options = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-my-message",
        functionArgs: [],
        network: stacksModules.STACKS_TESTNET,
        senderAddress: userAddress,
      };

      const result = await stacksModules.fetchCallReadOnlyFunction(options);
      const messageValue = stacksModules.cvToString(result);

      console.log("Raw result from blockchain:", result);
      console.log("Converted message value:", messageValue);

      if (
        !messageValue ||
        messageValue === '""' ||
        messageValue === '"none"' ||
        messageValue === "none"
      ) {
        setMyMessage(
          "No message found. Send your first message to the blockchain!"
        );
      } else {
        const cleanedMessage = messageValue.replace(/"/g, "").trim();
        if (cleanedMessage.length === 0 || cleanedMessage === "none") {
          setMyMessage(
            "No message found. Send your first message to the blockchain!"
          );
        } else {
          setMyMessage(cleanedMessage);
        }
      }
    } catch (error) {
      console.error("Error fetching message:", error);
      setMyMessage("Error loading message");
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, stacksModules, userAddress]);

  const updateMessage = useCallback(async () => {
    if (!isConnected || !message.trim() || !stacksModules) return;

    setIsLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "set-message",
        functionArgs: [stacksModules.stringUtf8CV(message)],
        network: stacksModules.STACKS_TESTNET,
        appDetails: {
          name: APP_NAME,
          icon: window.location.origin + "/favicon.ico",
        },
        onFinish: (data: { txId: string }) => {
          setTxId(data.txId);
          setMessage("");
          setTimeout(() => fetchMyMessage(), 3000);
        },
      };
      await stacksModules.openContractCall(txOptions);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, message, stacksModules, fetchMyMessage]);

  const clearMessage = useCallback(async () => {
    if (!isConnected || !stacksModules) return;

    setIsLoading(true);
    try {
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "clear-message",
        functionArgs: [],
        network: stacksModules.STACKS_TESTNET,
        appDetails: {
          name: APP_NAME,
          icon: window.location.origin + "/favicon.ico",
        },
        onFinish: (data: { txId: string }) => {
          setTxId(data.txId);
          setMyMessage(
            "No message found. Send your first message to the blockchain!"
          );
          setTimeout(() => fetchMyMessage(), 3000);
        },
      };
      await stacksModules.openContractCall(txOptions);
    } catch (error) {
      console.error("Error clearing message:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, stacksModules, fetchMyMessage]);

  // Show loading error
  if (loadingError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load
          </h2>
          <p className="text-sm text-gray-600 mb-6">{loadingError}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show loading while modules are loading
  if (!stacksModules) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading wallet modules...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  MessageBoard v2
                </h1>
                <p className="text-sm text-gray-500">
                  Decentralized messaging on Stacks
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Testnet</p>
              <p className="text-xs font-mono text-gray-600">
                {CONTRACT_ADDRESS.slice(0, 8)}...
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Connection Status Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-center">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    isConnected ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  {isConnected ? (
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  )}
                </div>

                {!isConnected ? (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Connect Wallet
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Connect your Stacks wallet to start messaging
                    </p>
                    <button
                      onClick={connectWallet}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Connect Wallet
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Connected
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-500 mb-1">Address</p>
                      <p className="font-mono text-sm text-gray-900 break-all">
                        {userAddress}
                      </p>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Send Message Card */}
            {isConnected && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <svg
                    className="w-5 h-5 text-indigo-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Send Message
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <textarea
                      placeholder="Write your message to store on the blockchain..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={280}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span
                        className={`text-sm ${
                          message.length > 250
                            ? "text-red-500"
                            : "text-gray-500"
                        }`}
                      >
                        {message.length}/280 characters
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={updateMessage}
                    disabled={!message.trim() || isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </div>
                    ) : (
                      "Send to Blockchain"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Current Message Card */}
            {isConnected && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Your Message
                    </h2>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={fetchMyMessage}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Refresh
                    </button>
                    <button
                      onClick={clearMessage}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Clear
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 min-h-[100px] flex items-center">
                  {isLoading ? (
                    <div className="flex items-center text-gray-500">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Loading...
                    </div>
                  ) : (
                    <p className="text-gray-900 leading-relaxed">{myMessage}</p>
                  )}
                </div>
              </div>
            )}

            {/* Transaction Status */}
            {txId && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-green-600 mr-3 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-green-800 mb-1">
                      Transaction Submitted
                    </h3>
                    <p className="text-sm text-green-700 mb-2">
                      Your message has been sent to the blockchain.
                    </p>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">
                        Transaction ID
                      </p>
                      <p className="font-mono text-sm text-gray-900 break-all">
                        {txId}
                      </p>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      Processing on the blockchain. This may take a few minutes
                      to confirm.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <span>Built on Stacks Blockchain</span>
              <span className="text-gray-300">•</span>
              <span>Decentralized & Permanent</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Network: Testnet</span>
              <a
                href={`https://explorer.stacks.co/address/${CONTRACT_ADDRESS}?chain=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View Contract
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
