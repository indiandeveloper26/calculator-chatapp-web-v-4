"use client";

import React, { useState, useRef, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";

import { FiSearch, FiMoreVertical, FiArrowLeft } from "react-icons/fi";
import { ChatContext } from "../context/chatcontext";
import api from "../apicall";

export default function WhatsAppLayout() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const inputRef = useRef(null);
    const debounceTimeout = useRef(null);

    const { setlogin, myUsername } = useContext(ChatContext);
    const router = useRouter();
    console.log('data', users)

    // Logout function
    const logout = () => {
        localStorage.clear();

        router.push("/login");
    };

    // Search users API
    const searchUsers = async (query) => {


        router.push('search')
        // if (!query.trim()) {
        //     setUsers([]);
        //     setLoading(false);
        //     return;
        // }
        // setLoading(true);
        // try {
        //     const response = await api.post("/search", { username: query });
        //     const data = response?.data;
        //     console.log(response)

        //     if (data?.error) setUsers([]);
        //     else if (Array.isArray(data)) setUsers(data);
        //     else if (typeof data === "object") setUsers([data]);
        //     else setUsers([]);
        // } catch (e) {
        //     console.error("Search error:", e);
        //     setUsers([]);
        // } finally {
        //     setLoading(false);
        // }
    };

    const handleSearchInput = (text) => {
        setSearchQuery(text);
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => searchUsers(text), 400);
    };

    const handleUserClick = (userId) => {
        router.push(`/chatroom/${userId}`);
        closeSearchModal();
    };

    const closeSearchModal = () => {
        setSearchOpen(false);
        setSearchQuery("");
        setUsers([]);
    };

    return (
        <div className="flex justify-between items-center p-5 bg-green-700 text-white relative">
            <h1 className="text-xl font-bold">ChatAppwtih  {myUsername}</h1>

            <div className="flex items-center gap-4">
                <button onClick={() => setSearchOpen(true)}>
                    <FiSearch size={22} />
                </button>
                <button onClick={() => setMenuOpen(!menuOpen)}>
                    <FiMoreVertical size={22} />
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                    <div className="absolute top-16 right-5 bg-white text-black rounded shadow-lg w-52 z-50">
                        {["New group", "New broadcast", "Linked devices", "Settings"].map((item, idx) => (
                            <button
                                key={idx}
                                className="w-full text-left px-4 py-3 hover:bg-gray-100"
                                onClick={() => setMenuOpen(false)}
                            >
                                {item}
                            </button>
                        ))}
                        <button
                            className="w-full text-left px-4 py-3 text-red-600 font-bold hover:bg-gray-100"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>

            {/* Search Modal */}
            {searchOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col">
                    <div className="flex items-center p-4 bg-green-700">
                        <button onClick={closeSearchModal} className="mr-4 text-white">
                            <FiArrowLeft size={24} />
                        </button>
                        <input
                            ref={inputRef}
                            value={searchQuery}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            placeholder="Search users..."
                            className="flex-1 p-2 rounded"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto bg-white">
                        {loading ? (
                            <div className="text-center mt-5">Loading...</div>
                        ) : users.length > 0 ? (
                            users.map((user, index) => (
                                <div
                                    key={user._id || index}
                                    className="flex items-center p-4 border-b cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleUserClick(user._id || user.username)}
                                >
                                    <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center mr-4">
                                        <span className="text-white font-bold">
                                            {user.username?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-semibold">{user.username || user.name}</div>
                                        <div className="text-sm text-gray-500">Tap to start chat</div>
                                    </div>
                                </div>
                            ))
                        ) : searchQuery.trim().length > 0 ? (
                            <div className="text-center mt-5">No users found 😕</div>
                        ) : (
                            <div className="text-center mt-5">Type to search users 🔍</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
