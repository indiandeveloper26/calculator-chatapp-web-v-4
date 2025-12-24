"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "../context/chatcontext";
import { useSearchParams, useRouter } from "next/navigation";

const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoCall() {
    const { socket, myUsername } = useContext(ChatContext);
    const params = useSearchParams();
    const router = useRouter();

    const userId = params.get("user");
    const isCaller = params.get("caller") === "true";

    const pc = useRef(null);
    const localRef = useRef();
    const remoteRef = useRef();

    const [localStream, setLocalStream] = useState(null);

    // peer
    useEffect(() => {
        pc.current = new RTCPeerConnection(config);

        pc.current.ontrack = (e) => {
            console.log("🎥 remote stream");
            remoteRef.current.srcObject = e.streams[0];
        };

        pc.current.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit("webrtc-candidate", {
                    to: userId,
                    candidate: e.candidate,
                });
            }
        };
    }, []);

    // media
    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                setLocalStream(stream);
                localRef.current.srcObject = stream;
                stream.getTracks().forEach((t) => pc.current.addTrack(t, stream));
            });
    }, []);

    // caller
    useEffect(() => {
        if (!isCaller || !localStream) return;

        (async () => {
            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);

            socket.emit("webrtc-offer", {
                to: userId,
                sdp: offer.sdp,
            });
        })();
    }, [localStream]);

    // socket
    useEffect(() => {
        socket.on("webrtc-offer", async ({ from, sdp }) => {
            await pc.current.setRemoteDescription({ type: "offer", sdp });
            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);

            socket.emit("webrtc-answer", {
                to: from,
                sdp: answer.sdp,
            });
        });

        socket.on("webrtc-answer", async ({ sdp }) => {
            await pc.current.setRemoteDescription({ type: "answer", sdp });
        });

        socket.on("webrtc-candidate", async ({ candidate }) => {
            await pc.current.addIceCandidate(candidate);
        });

        socket.on("end-call", () => router.back());
    }, []);

    return (
        <div style={{ background: "#000", height: "100vh" }}>
            <video ref={remoteRef} autoPlay playsInline style={{ width: "100%" }} />
            <video
                ref={localRef}
                autoPlay
                muted
                playsInline
                style={{ width: 150, position: "absolute", top: 20, right: 20 }}
            />
        </div>
    );
}
