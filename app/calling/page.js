


"use client";
import React, { useContext, useEffect, useRef } from "react";
import { ChatContext } from "../context/chatcontext";
import { useRouter } from "next/navigation";

export default function IncomingCall() {
    const { incomingCall, setIncomingCall, myUsername, socket } = useContext(ChatContext);
    const router = useRouter();
    const audioRef = useRef(null);

    // Play ringtone on incoming call
    useEffect(() => {
        if (incomingCall) {
            // Create audio element
            const audio = new Audio("/ringtone.mp3"); // public folder me rakho
            audio.loop = true;
            audio.play().catch((err) => console.log("Audio play failed:", err));
            audioRef.current = audio;
        } else {
            // Stop audio if no incoming call
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
        };
    }, [incomingCall]);

    const acceptCall = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        setIncomingCall(null);
        router.push(`/call?with=${incomingCall.from}`);
    };

    const rejectCall = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        socket.emit("reject-call", { from: myUsername, to: incomingCall.from });
        setIncomingCall(null);
    };

    if (!incomingCall) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.card}>
                <h2 style={styles.title}>
                    {incomingCall.from} is calling you ({incomingCall.type})
                </h2>

                <div style={styles.buttons}>
                    <button style={{ ...styles.button, ...styles.accept }} onClick={acceptCall}>
                        Accept
                    </button>

                    <button style={{ ...styles.button, ...styles.reject }} onClick={rejectCall}>
                        Reject
                    </button>
                </div>
            </div>
        </div>
    );
}

// Styles same as before
const styles = {
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 },
    card: { backgroundColor: "#fff", padding: "30px", borderRadius: "16px", width: "90%", maxWidth: "400px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" },
    title: { fontSize: "18px", color: "#000", marginBottom: "20px", fontWeight: "600" },
    buttons: { display: "flex", justifyContent: "space-between", gap: "10px" },
    button: { flex: 1, padding: "12px", borderRadius: "10px", color: "#fff", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "16px", transition: "0.2s ease" },
    accept: { backgroundColor: "#4CAF50" },
    reject: { backgroundColor: "#f44336" },
};
