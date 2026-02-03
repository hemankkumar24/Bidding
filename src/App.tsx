import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Products from './components/Products';
import { socket } from "./socket";
import toast from 'react-hot-toast';

export const App = () => {
  const [userName, setUserName] = useState("");
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  const handleSubmit = () => {
    if (!userName.trim()) return;
    toast.success("Saved Name Successfully")
    setShowOverlay(false);
  };

  return (
    <>
      {showOverlay && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Enter your name</h2>
            <p className="text-sm text-gray-500 mb-4">
              This will be shown during bidding
            </p>

            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
              className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-black"
            />

            <button
              onClick={handleSubmit}
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Main App */}
      <div className='w-full min-h-screen bg-stone-50'>
        <div className='w-full h-full max-w-10/12 mx-auto'>
          <Navbar />
          <Products userName={userName} />
        </div>
      </div>
    </>
  );
};
