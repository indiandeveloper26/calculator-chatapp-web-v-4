




"use client"; // ✅ must for client-side React hooks

export const dynamic = "force-dynamic";

import React, { createContext, useState, useEffect, useCallback } from "react";
import socket from "../socket.js"; // ✅ your Socket.IO client instance

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [myUsername, setMyUsername] = useState("");
    const [messages, setMessages] = useState([]);
    const [chatList, setChatList] = useState([]);
    const [typingUser, setTypingUser] = useState(null);
    const [pathname, setpath] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [deletedUsers, setDeletedUsers] = useState([]);
    const [groupMessages, setGroupMessages] = useState([]); // { groupId: [msgs] }
    // ✅ incoming call states
    const [incomingCall, setIncomingCall] = useState(false);
    const [incomingUser, setIncomingUser] = useState("");

    // ✅ premium user
    const [isPremium, setIsPremium] = useState(false);
    const [premiumExpiry, setPremiumExpiry] = useState(null);

    // ✅ UUID generator
    const uuidv4 = () =>
        "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });

    // ✅ connect socket + restore user
    useEffect(() => {
        if (!socket.connected) socket.connect();
        const name = localStorage.getItem("username");
        if (name) setMyUsername(name);
    }, []);

    // ✅ register username on socket
    useEffect(() => {


        if (!myUsername) return;

        if (!socket.connected) socket.connect();
        console.log('run setname user', myUsername)
        socket.emit("setUsername", myUsername);

        const savedList = localStorage.getItem(`chatlist_${myUsername}`);
        const savedMsgs = localStorage.getItem(`messages_${myUsername}`);
        const savedDeleted = localStorage.getItem(`deleted_${myUsername}`);

        if (savedList) setChatList(JSON.parse(savedList));
        if (savedMsgs) setMessages(JSON.parse(savedMsgs));
        if (savedDeleted) setDeletedUsers(JSON.parse(savedDeleted));
    }, [myUsername]);

    // ✅ Online/offline sync
    useEffect(() => {
        socket.on("userStatus", ({ username, online }) => {
            setOnlineUsers((prev) => {
                const filtered = prev.filter((u) => u !== username);
                return online ? [...filtered, username] : filtered;
            });
        });
        return () => socket.off("userStatus");
    }, []);

    // ✅ Typing indicator
    useEffect(() => {
        socket.on("typing", ({ from }) => {
            setTypingUser(from);
            setTimeout(() => setTypingUser(null), 2000);
        });
        return () => socket.off("typing");
    }, []);

    // ✅ Handle incoming call
    useEffect(() => {

        console.log(groupMessages)
        const handleIncomingCall = ({ from }) => {
            console.log("📞 Incoming call from:", from);
            setIncomingUser(from);
            setIncomingCall(true);
        };

        const handleCallAccepted = ({ from }) => {
            console.log("✅ Call accepted by:", from);
        };

        const handleCallRejected = ({ from }) => {
            console.log("❌ Call rejected by:", from);
            setIncomingCall(false);
        };

        const handleGroupMessage = (msg) => {
            const groupId = msg.groupId || "default";

            console.log(msg)// backend se aayega

            setGroupMessages(prev => {
                const prevMsgs = prev[groupId] || [];
                return {
                    ...prev,
                    [groupId]: [...prevMsgs, msg]
                };
            });
        };



        socket.on("incoming-call", handleIncomingCall);
        socket.on("call-accepted", handleCallAccepted);
        socket.on("call-rejected", handleCallRejected);
        socket.on("groupmessage", handleGroupMessage);

        // Cleanup
        return () => {
            socket.off("incoming-call", handleIncomingCall);
            socket.off("call-accepted", handleCallAccepted);
            socket.off("call-rejected", handleCallRejected);
            socket.off("groupmessage", handleGroupMessage);

        };
    }, [socket]);

    // useEffect(() => {
    //     // make sure groupId is sent inside joinGroup()

    //     socket.on("groupmessage", (msg) => {
    //         console.log(msg);

    //         setGroupMessages(msg.text)

    //         console.log('staus this ', groupMessages)


    //         // const groupId = msg.groupId || "default"; // ya server se aayega

    //         // setGroupMessages((prev) => {
    //         //     const prevMsgs = prev[groupId] || [];
    //         //     return { ...prev, [groupId]: [...prevMsgs, msg] };
    //         // });
    //     });

    //     return () => socket.off("groupmessage");
    // }, []);



    const joinGroup = (groupId) => {
        socket.emit("joinGroup", { groupId, username: myUsername });
    };

    // ✅ Leave group
    const leaveGroup = (groupId) => {
        socket.emit("leaveGroup", { groupId, username: myUsername });
        setGroupMessages((prev) => ({ ...prev, [groupId]: [] }));
    };

    const sendGroupMessage = (id, myUsername, input) => {


        // if (!text) return;
        socket.emit("groupMessage", { groupId: id, username: myUsername, text: input });
        setGroupMessages((prev) => {
            const prevMsgs = prev[id] || [];
            return { ...prev, [id]: [...prevMsgs, { username: myUsername, input, timestamp: new Date().toISOString() }] };
        });
    };


    // ✅ Handle incoming message
    const handleIncomingMessage = useCallback(
        (msg) => {
            if (!msg.id) return;

            const { from, to, message, type } = msg;
            const otherUser = from === myUsername ? to : from;

            if (deletedUsers.includes(otherUser)) return;

            // save messages
            setMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                const updated = [...prev, msg];
                localStorage.setItem(
                    `messages_${myUsername}`,
                    JSON.stringify(updated)
                );
                return updated;
            });

            // update chat list
            setChatList((prev) => {
                const index = prev.findIndex((c) => c.adduser === otherUser);
                let updated;
                if (index !== -1) {
                    updated = [...prev];
                    updated[index] = {
                        ...updated[index],
                        lastMessage: type === "image" ? "📷 Photo" : message,
                        unreadCount:
                            from === myUsername ? 0 : (updated[index].unreadCount || 0) + 1,
                    };
                    const [moved] = updated.splice(index, 1);
                    updated.unshift(moved);
                } else {
                    updated = [
                        {
                            adduser: otherUser,
                            lastMessage: type === "image" ? "📷 Photo" : message,
                            unreadCount: from === myUsername ? 0 : 1,
                        },
                        ...prev,
                    ];
                }
                localStorage.setItem(
                    `chatlist_${myUsername}`,
                    JSON.stringify(updated)
                );
                return updated;
            });
        },
        [myUsername, deletedUsers]
    );

    // ✅ Listen to private messages
    useEffect(() => {
        if (!myUsername) return;
        socket.on("privateMessage", handleIncomingMessage);
        return () => socket.off("privateMessage", handleIncomingMessage);
    }, [myUsername, handleIncomingMessage]);

    // ✅ Send message
    const sendMessage = (to, message, type = "text") => {
        const payload = {
            id: uuidv4(),
            from: myUsername,
            to,
            message,
            type,
            timestamp: new Date().toISOString(),
            seen: false,
        };
        socket.emit("sendMessage", payload);
        handleIncomingMessage(payload);
    };

    // ✅ Start calling
    const startCalling = (id) => {
        socket.emit("call-user", { from: myUsername, to: id });
    };


    const apptesd = () => {

        socket.emit("accept-call", { from: myUsername, to: incomingCall.from });
    }

    // ✅ Mark chat as read
    const markChatAsRead = (otherUser) => {
        setChatList((prev) => {
            const updated = prev.map((item) =>
                item.adduser === otherUser ? { ...item, unreadCount: 0 } : item
            );
            localStorage.setItem(`chatlist_${myUsername}`, JSON.stringify(updated));
            return updated;
        });
    };

    // ✅ Delete chat
    const addToDeletedUsers = (user) => {
        setDeletedUsers((prev) => {
            const updated = prev.includes(user) ? prev : [...prev, user];
            localStorage.setItem(`deleted_${myUsername}`, JSON.stringify(updated));
            return updated;
        });
    };

    // ✅ Logout
    const clearAll = () => {
        setMyUsername("");
        setMessages([]);
        setChatList([]);
        setTypingUser(null);
        setOnlineUsers([]);
        setDeletedUsers([]);
        setIncomingCall(false);
        setIncomingUser("");
        setIsPremium(false);
        localStorage.clear();
    };

    // ✅ Premium update
    const updatePremium = (status, expiryDate) => {
        setIsPremium(status);
        if (status && expiryDate) {
            localStorage.setItem("premiumExpiry", expiryDate);
            setPremiumExpiry(expiryDate);
        } else {
            localStorage.removeItem("premiumExpiry");
            setPremiumExpiry(null);
        }
    };

    const visibleChats = chatList.filter(
        (c) => !deletedUsers.includes(c.adduser)
    );

    return (
        <ChatContext.Provider
            value={{
                socket,
                myUsername,
                messages,
                visibleChats,
                typingUser,
                onlineUsers,
                deletedUsers,
                incomingCall,
                setIncomingCall,
                incomingUser,
                setIncomingUser,
                startCalling,
                sendMessage,
                markChatAsRead,
                apptesd,
                addToDeletedUsers,
                setMyUsername,
                clearAll,
                isPremium,
                updatePremium,
                sendGroupMessage,
                joinGroup,

                groupMessages,
                premiumExpiry,
                setpath,
                pathname
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
