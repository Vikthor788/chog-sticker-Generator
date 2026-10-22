import { useState, useEffect } from "react";
import { generateSticker } from "./utils/generateSticker";
import { getUserChogs } from "./utils/chog";

const REACTIONS = ["neutral", "happy", "angry", "shocked", "laughing", "cool"];

export default function App() {
  const [account, setAccount] = useState(null);
  const [holdsChog, setHoldsChog] = useState(false);
  const [userChogs, setUserChogs] = useState([]);
  const [selectedChog, setSelectedChog] = useState(null);
  const [selectedReaction, setSelectedReaction] = useState("happy");
  const [sticker, setSticker] = useState(null);
  const [activeTab, setActiveTab] = useState("generate");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, chogId: 482, text: "just made my angry sticker", sticker: null },
  ]);
  const [chatInput, setChatInput] = useState("");

  const connect = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
  };

  const loadChogs = async (address) => {
    setLoading(true);
    try {
      const chogs = await getUserChogs(address);
      setUserChogs(chogs);
      if (chogs.length > 0) {
        setHoldsChog(true);
        setSelectedChog(chogs[0]);
      } else {
        setHoldsChog(false);
      }
    } catch (err) {
      console.error(err);
      setHoldsChog(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (account) loadChogs(account);
  }, [account]);

  const handleGenerate = async () => {
    if (!selectedChog?.image) return alert("No Chog image found");
    const result = await generateSticker(
      selectedChog.image,
      selectedReaction,
      selectedChog.id
    );
    setSticker(result);
  };

  const sendMessage = () => {
    if (!chatInput.trim() && !sticker) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        chogId: selectedChog?.id || "???",
        text: chatInput,
        sticker: sticker || null,
      },
    ]);
    setChatInput("");
  };

  const sendStickerToChat = () => {
    if (!sticker || !selectedChog) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        chogId: selectedChog.id,
        text: "",
        sticker,
      },
    ]);
    setActiveTab("chat");
  };

  return (
    <div className="min-h-screen bg-[#0a0014] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-transparent to-transparent pointer-events-none" />

      <header className="relative border-b border-purple-500/20 bg-black/50 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
              CHOG STICKERS
            </h1>
            <p className="text-xs text-purple-400 mt-1">Holders only • Generate & trade</p>
          </div>

          {!account ? (
            <button
              onClick={connect}
              className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 px-7 py-3 rounded-2xl font-bold shadow-lg shadow-fuchsia-500/20"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="text-right">
              <p className="text-sm font-medium">
                {account.slice(0, 6)}...{account.slice(-4)}
              </p>
              {loading ? (
                <p className="text-xs text-purple-400 mt-1">Loading Chogs...</p>
              ) : holdsChog ? (
                <p className="text-sm text-emerald-400 font-semibold mt-1">
                  {userChogs.length} Chog{userChogs.length > 1 ? "s" : ""}
                </p>
              ) : (
                <p className="text-xs text-red-400 mt-1">No Chog found</p>
              )}
            </div>
          )}
        </div>
      </header>

      {!account ? null : loading ? (
        <div className="text-center py-32 text-purple-300">Loading your Chogs...</div>
      ) : !holdsChog ? (
        <div className="relative max-w-xl mx-auto text-center py-40 px-6">
          <h2 className="text-5xl font-black mb-6">HOLDERS ONLY</h2>
          <p className="text-purple-300 text-lg">
            You need to hold a Chog to generate stickers and enter the chat.
          </p>
        </div>
      ) : (
        <main className="relative max-w-5xl mx-auto px-6 py-10">
          {/* Owned Chogs */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {userChogs.map((chog) => (
              <button
                key={chog.id}
                onClick={() => setSelectedChog(chog)}
                className={`flex-shrink-0 rounded-2xl overflow-hidden border-2 transition ${
                  selectedChog?.id === chog.id
                    ? "border-fuchsia-500"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={chog.image} alt="" className="w-16 h-16 object-cover" />
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-10">
            {["generate", "chat"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-2xl font-bold capitalize transition ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 shadow-lg shadow-fuchsia-500/30"
                    : "bg-purple-950/60 hover:bg-purple-900/60"
                }`}
              >
                {tab === "generate" ? "Generate" : "Sticker Chat"}
              </button>
            ))}
          </div>

          {/* GENERATE */}
          {activeTab === "generate" && selectedChog && (
            <div>
              <div className="flex flex-wrap gap-3 mb-8">
                {REACTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedReaction(r)}
                    className={`px-6 py-3 rounded-xl font-semibold capitalize transition ${
                      selectedReaction === r
                        ? "bg-white text-purple-950"
                        : "bg-purple-900/50 hover:bg-purple-800/60"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 px-10 py-5 rounded-2xl font-black text-xl shadow-xl shadow-fuchsia-500/20 mb-10"
              >
                Generate {selectedReaction}
              </button>

              {sticker && (
                <div className="inline-block bg-purple-950/40 border border-purple-500/30 rounded-3xl p-6">
                  <img src={sticker} alt="sticker" className="w-72 h-72 rounded-2xl" />
                  <div className="flex gap-3 mt-5">
                    <a
                      href={sticker}
                      download={`chog-${selectedChog.id}-${selectedReaction}.png`}
                      className="flex-1 text-center bg-white text-purple-950 font-bold py-3 rounded-xl"
                    >
                      Download
                    </a>
                    <button
                      onClick={sendStickerToChat}
                      className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-500 font-bold py-3 rounded-xl"
                    >
                      Send to Chat
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CHAT */}
          {activeTab === "chat" && (
            <div className="bg-purple-950/30 border border-purple-500/20 rounded-3xl overflow-hidden">
              <div className="p-5 border-b border-purple-500/20">
                <h3 className="font-bold">Holder Sticker Chat</h3>
              </div>

              <div className="h-[420px] overflow-y-auto p-5 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      #{msg.chogId}
                    </div>
                    <div>
                      {msg.text && <p className="text-sm">{msg.text}</p>}
                      {msg.sticker && (
                        <img src={msg.sticker} alt="" className="w-32 h-32 mt-1 rounded-xl" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-purple-500/20 flex gap-3">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Say something..."
                  className="flex-1 bg-black/40 border border-purple-500/30 rounded-xl px-4 py-3 text-sm outline-none"
                />
                <button
                  onClick={sendMessage}
                  className="bg-fuchsia-600 hover:bg-fuchsia-500 px-6 rounded-xl font-bold"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
