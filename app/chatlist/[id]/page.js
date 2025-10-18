














"use client";
import { useContext, useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatContext } from "../../context/chatcontext.jsx";
import { FiArrowLeft, FiPhone, FiVideo, FiMoreVertical } from "react-icons/fi";
import Image from "next/image";

export default function ChatRoom() {
    const { id } = useParams();
    const router = useRouter();
    const { messages, myUsername, sendMessage, onlineUsers, startCalling, socket, typingUser } =
        useContext(ChatContext);

    const [input, setInput] = useState("");
    const [previewImg, setPreviewImg] = useState(null);
    const messagesEndRef = useRef();

    const filtered = messages.filter(
        (m) => (m.from === myUsername && m.to === id) || (m.from === id && m.to === myUsername)
    );

    const displayMessages =
        typingUser === id ? [...filtered, { id: "typing", from: id, message: "" }] : filtered;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [displayMessages]);

    const handleSend = () => {
        if (input.trim()) {
            sendMessage(id, input.trim(), "text");
            setInput("");
        }
    };

    const handleTyping = (text) => {
        setInput(text);
        if (text.trim()) {
            socket.emit("typing", { from: myUsername, to: id });
        }
    };

    const handlePickImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("https://chat-app-server-render-v-1.onrender.com/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            sendMessage(id, data.url, "image");
        } catch (err) {
            console.log("Upload failed:", err);
            alert("Upload failed");
        }
    };

    const startAudioCall = () => {
        router.push(`/chatlist/${id}/call/audio`);
    };

    const startVideoCall = () => {
        try {
            startCalling(id);
        } catch (error) {
            console.log("Error starting call:", error);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Responsive WhatsApp-style Header */}
            <div className="flex justify-between items-center px-4 h-16 bg-[#075E54] text-white">
                <div className="flex items-center">
                    <button onClick={() => router.back()} className="mr-3">
                        <FiArrowLeft size={24} />
                    </button>
                    <Image
                        src={`https://placekitten.com/40/40`}
                        alt="Group"
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                    <div className="ml-3 flex flex-col truncate">
                        <span className="font-semibold text-base sm:text-lg truncate">{id}</span>
                        <span className={`text-xs sm:text-sm truncate ${onlineUsers.includes(id) ? "text-green-400" : "text-gray-300"}`}>
                            {onlineUsers.includes(id) ? "Online" : "Offline"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={startAudioCall}
                        className="bg-green-500 p-2 rounded-full hover:bg-green-600"
                    >
                        <FiPhone size={18} />
                    </button>
                    <button
                        onClick={startVideoCall}
                        className="bg-blue-600 p-2 rounded-full hover:bg-blue-700"
                    >
                        <FiVideo size={18} />
                    </button>
                    <FiMoreVertical size={20} className="cursor-pointer" />
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-100 sm:p-4">
                {displayMessages.map((msg) => {
                    const isMine = msg.from === myUsername;
                    const isTyping = msg.id === "typing";
                    return (
                        <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`p-3 rounded-xl max-w-[80%] sm:max-w-[70%] ${isMine ? "bg-green-500 rounded-br-none text-white" : "bg-white rounded-bl-none text-black"
                                    }`}
                            >
                                {isTyping ? (
                                    <div className="flex space-x-1">
                                        <span className="animate-bounce">•</span>
                                        <span className="animate-bounce delay-150">•</span>
                                        <span className="animate-bounce delay-300">•</span>
                                    </div>
                                ) : msg.type === "image" ? (
                                    <img
                                        src={msg.message}
                                        alt="sent"
                                        className="w-full max-w-xs sm:max-w-[200px] h-auto object-cover rounded-lg cursor-pointer"
                                        onClick={() => setPreviewImg(msg.message)}
                                    />
                                ) : (
                                    <p className="text-sm sm:text-base">{msg.message}</p>
                                )}
                                {isMine && !isTyping && (
                                    <p className="text-xs mt-1">{msg.seen ? "✓✓ Seen" : "✓ Sent"}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="flex flex-col sm:flex-row p-3 bg-white items-center gap-2 sm:gap-3">
                <input type="file" accept="image/*" onChange={handlePickImage} className="text-sm" />
                <input
                    value={input}
                    onChange={(e) => handleTyping(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 rounded-full border border-gray-300 outline-none text-sm sm:text-base"
                />
                <button
                    onClick={handleSend}
                    className="bg-green-500 px-4 py-2 rounded-full text-white font-semibold hover:bg-green-600"
                >
                    Send
                </button>
            </div>

            {/* Preview Modal */}
            {previewImg && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2"
                    onClick={() => setPreviewImg(null)}
                >
                    <img src={previewImg} className="max-h-[90%] max-w-full sm:max-w-[90%] object-contain rounded-lg" />
                </div>
            )}
        </div>
    );
}
