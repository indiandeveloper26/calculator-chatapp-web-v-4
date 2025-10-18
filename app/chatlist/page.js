









"use client";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { ChatContext } from "../context/chatcontext.jsx";
import { motion } from "framer-motion";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function ChatList() {
    const [username, setUsername] = useState("");
    const [activeTab, setActiveTab] = useState("all"); // all or groups
    const router = useRouter();
    const { visibleChats = [], markChatAsRead, onlineUsers = [], addToDeletedUsers } = useContext(ChatContext);

    useEffect(() => {
        const savedName = localStorage.getItem("username");
        setUsername(savedName);
    }, []);

    const openChat = async (item) => {
        await markChatAsRead?.(item.adduser);
        router.push(`/chatlist/${item.adduser}`);
    };

    const deleteChat = (user) => {
        if (window.confirm(`Delete chat with ${user}?`)) {
            addToDeletedUsers?.(user);
        }
    };

    const renderChats = () => {
        if (visibleChats.length === 0) {
            return <div className="text-center text-gray-400 mt-8 text-sm">No chats yet. Start chatting!</div>;
        }

        return visibleChats.map((item, idx) => {
            const isOnline = onlineUsers.includes(item.adduser);
            const firstLetter = item.adduser.charAt(0).toUpperCase();

            return (
                <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                    <button className="flex items-center flex-1 text-left" onClick={() => openChat(item)}>
                        <div className="relative w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center mr-3">
                            <span className="font-bold text-lg text-gray-700 dark:text-gray-200">{firstLetter}</span>
                            <span
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${isOnline ? "bg-green-500" : "bg-gray-400"
                                    }`}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm dark:text-gray-200 truncate">{item.adduser}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.lastMessage || "Say hi!"}</p>
                        </div>
                        {item.unreadCount > 0 && (
                            <span className="ml-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">{item.unreadCount}</span>
                        )}
                    </button>
                    <button onClick={() => deleteChat(item.adduser)} className="ml-2 p-2 bg-red-500 hover:bg-red-600 rounded-full">
                        <TrashIcon className="h-5 w-5 text-white" />
                    </button>
                </motion.div>
            );
        });
    };

    return (
        <div className="flex-1 flex flex-col overflow-y-auto p-2 sm:p-4 space-y-3">
            {/* Tabs */}
            <div className="flex justify-center space-x-8 mb-4 border-b border-gray-300 dark:border-gray-700">
                <h1
                    className={`cursor-pointer text-lg font-semibold pb-2 ${activeTab === "all"
                        ? "border-b-2 border-green-500 text-green-500"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                    onClick={() => setActiveTab("all")}
                >
                    All
                </h1>
                <h1
                    className="cursor-pointer text-lg font-semibold pb-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={() => router.push("/grouplist")} // Navigate to groups route
                >
                    Groups
                </h1>
            </div>

            {/* Content */}
            {activeTab === "all" && <div className="space-y-2">{renderChats()}</div>}
            {/* Groups content removed from here, ab Groups route handle karega */}
        </div>
    );
}
