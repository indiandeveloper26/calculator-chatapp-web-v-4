// // "use client";

// // import { ChatContext } from "@/app/context/chatcontext";
// // import socket from "@/app/socket";
// // import { useParams, useRouter } from "next/navigation";
// // import { useState, useEffect, useContext } from "react";

// // export default function CallingScreen() {

// //     let { id } = useParams()
// //     let router = useRouter()

// //     console.log('iddd', id)
// //     const callee = {
// //         name: "Sahil",
// //         avatar: "/img.png", // अपने public folder में रखें
// //     };
// //     const [callAccepted, setCallAccepted] = useState(false);
// //     const [callActive, setCallActive] = useState(true);
// //     const [mediaType, setMediaType] = useState("video"); // default video
// //     const [dots, setDots] = useState(".");



// //     let { socket, myUsername, callchek,
// //         setcallchek, } = useContext(ChatContext)

// //     // console.log(callchek,
// //     // )

// //     // URL से media type (video/audio) सेट करना




// //     useEffect(() => {
// //         const params = new URLSearchParams(window.location.search);
// //         const type = params.get("type");
// //         if (type === "audio") setMediaType("audio");
// //     }, []);

// //     // Blinking dots animation
// //     useEffect(() => {
// //         const interval = setInterval(() => {
// //             setDots((prev) => (prev.length < 3 ? prev + "." : "."));
// //         }, 500);
// //         return () => clearInterval(interval);
// //     }, []);

// //     // End Call function
// //     const handleEndCall = () => {

// //         // alert('endign call')
// //         socket.emit('end-call', { to: id, from: myUsername })
// //         setCallActive(false); // <-- Call Ended Screen दिखाने के लिए
// //         router.push(`/chatlist/${id}`);
// //     };

// //     if (!callActive)
// //         return (
// //             <div
// //                 style={{
// //                     width: "100vw",
// //                     height: "100vh",
// //                     display: "flex",
// //                     justifyContent: "center",
// //                     alignItems: "center",
// //                     backgroundColor: "#111",
// //                     color: "#fff",
// //                 }}
// //             >
// //                 <h2>Call Ended</h2>
// //             </div>
// //         );

// //     return (
// //         <div
// //             style={{
// //                 width: "100vw",
// //                 height: "100vh",
// //                 display: "flex",
// //                 flexDirection: "column",
// //                 justifyContent: "center",
// //                 alignItems: "center",
// //                 backgroundColor: "#000",
// //                 color: "#fff",
// //                 gap: "30px",
// //                 fontFamily: "sans-serif",
// //             }}
// //         >
// //             {!callAccepted ? (
// //                 // Outgoing Calling Screen
// //                 <>
// //                     <img
// //                         src={callee.avatar}
// //                         alt={callee.name}
// //                         style={{ width: "120px", height: "120px", borderRadius: "50%" }}
// //                     />
// //                     <h2>Calling {callee.name}{dots}</h2>
// //                     <p>Waiting for the user to accept the call</p>
// //                     <button
// //                         onClick={handleEndCall}
// //                         style={{
// //                             padding: "12px 30px",
// //                             backgroundColor: "red",
// //                             color: "#fff",
// //                             border: "none",
// //                             borderRadius: "50px",
// //                             cursor: "pointer",
// //                             fontWeight: "bold",
// //                             marginTop: "20px",
// //                         }}
// //                     >
// //                         Cancel Call
// //                     </button>
// //                 </>
// //             ) : (
// //                 // Call Accepted Screen
// //                 <>
// //                     <h2>In Call with {callee.name}</h2>

// //                     {mediaType === "video" ? (
// //                         <div
// //                             style={{
// //                                 width: "80%",
// //                                 height: "60%",
// //                                 backgroundColor: "#333",
// //                                 borderRadius: "12px",
// //                                 overflow: "hidden",
// //                             }}
// //                         >
// //                             <video
// //                                 autoPlay
// //                                 muted
// //                                 style={{ width: "100%", height: "100%", objectFit: "cover" }}
// //                             >
// //                                 <source src="/media/sample-video.mp4" type="video/mp4" />
// //                             </video>
// //                         </div>
// //                     ) : (
// //                         <audio autoPlay controls style={{ marginTop: "20px" }}>
// //                             <source src="/media/sample-audio.mp3" type="audio/mpeg" />
// //                         </audio>
// //                     )}

// //                     <button
// //                         onClick={handleEndCall}
// //                         style={{
// //                             marginTop: "20px",
// //                             padding: "12px 30px",
// //                             backgroundColor: "red",
// //                             color: "#fff",
// //                             border: "none",
// //                             borderRadius: "50px",
// //                             cursor: "pointer",
// //                             fontWeight: "bold",
// //                         }}
// //                     >
// //                         End Call
// //                     </button>
// //                 </>
// //             )}
// //         </div>
// //     );
// // }














// "use client";

// import { useEffect, useRef, useState, useContext } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { ChatContext } from "@/app/context/chatcontext";

// const configuration = {
//     iceServers: [
//         { urls: "stun:stun.l.google.com:19302" },
//         { urls: "stun:stun1.l.google.com:19302" },
//     ],
// };

// export default function CallingScreen() {
//     const { id } = useParams(); // caller username
//     const router = useRouter();

//     const { socket, myUsername } = useContext(ChatContext);

//     // 🔑 SAME ROOM ID (RN jaisa)
//     const roomId = [myUsername, id].sort().join("_");

//     const localVideoRef = useRef(null);
//     const remoteVideoRef = useRef(null);
//     const pcRef = useRef(null);

//     const [callAccepted, setCallAccepted] = useState(false);

//     // 1️⃣ INIT PEER
//     useEffect(() => {
//         pcRef.current = new RTCPeerConnection(configuration);

//         pcRef.current.ontrack = (event) => {
//             remoteVideoRef.current.srcObject = event.streams[0];
//         };

//         pcRef.current.onicecandidate = (event) => {
//             if (event.candidate) {
//                 socket.emit("webrtc-candidate", {
//                     roomId,
//                     candidate: event.candidate,
//                 });
//             }
//         };

//         socket.emit("join-room", { roomId });

//         socket.on("webrtc-offer", async ({ sdp }) => {
//             setCallAccepted(true);

//             await pcRef.current.setRemoteDescription({
//                 type: "offer",
//                 sdp,
//             });

//             const stream = await navigator.mediaDevices.getUserMedia({
//                 video: true,
//                 audio: true,
//             });

//             localVideoRef.current.srcObject = stream;
//             stream.getTracks().forEach(track =>
//                 pcRef.current.addTrack(track, stream)
//             );

//             const answer = await pcRef.current.createAnswer();
//             await pcRef.current.setLocalDescription(answer);

//             socket.emit("webrtc-answer", {
//                 roomId,
//                 sdp: answer.sdp,
//             });
//         });

//         socket.on("webrtc-candidate", async ({ candidate }) => {
//             await pcRef.current.addIceCandidate(candidate);
//         });

//         socket.on("end-call", () => {
//             endCall();
//         });

//         return () => {
//             socket.removeAllListeners();
//             pcRef.current?.close();
//         };
//     }, []);

//     // 2️⃣ END CALL
//     const endCall = () => {
//         socket.emit("end-call", { roomId });
//         pcRef.current?.close();
//         router.push(`/chatlist/${id}`);
//     };

//     return (
//         <div style={styles.container}>
//             {!callAccepted ? (
//                 <>
//                     <h2>Incoming Call...</h2>
//                     <p>{id} is calling you</p>

//                     <button style={styles.accept}>
//                         Waiting for connection...
//                     </button>

//                     <button style={styles.end} onClick={endCall}>
//                         Reject
//                     </button>
//                 </>
//             ) : (
//                 <>
//                     <h3>In Call with {id}</h3>

//                     <div style={styles.videoBox}>
//                         <video
//                             ref={remoteVideoRef}
//                             autoPlay
//                             playsInline
//                             style={styles.video}
//                         />
//                     </div>

//                     <video
//                         ref={localVideoRef}
//                         autoPlay
//                         muted
//                         playsInline
//                         style={styles.local}
//                     />

//                     <button style={styles.end} onClick={endCall}>
//                         End Call
//                     </button>
//                 </>
//             )}
//         </div>
//     );
// }

// const styles = {
//     container: {
//         width: "100vw",
//         height: "100vh",
//         backgroundColor: "#000",
//         color: "#fff",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         gap: "20px",
//     },
//     videoBox: {
//         width: "80%",
//         height: "60%",
//         backgroundColor: "#222",
//         borderRadius: "12px",
//         overflow: "hidden",
//     },
//     video: {
//         width: "100%",
//         height: "100%",
//         objectFit: "cover",
//     },
//     local: {
//         width: "160px",
//         height: "120px",
//         position: "absolute",
//         bottom: "100px",
//         right: "20px",
//         borderRadius: "8px",
//         border: "2px solid white",
//     },
//     accept: {
//         padding: "12px 30px",
//         backgroundColor: "green",
//         borderRadius: "50px",
//         color: "#fff",
//         border: "none",
//     },
//     end: {
//         padding: "12px 30px",
//         backgroundColor: "red",
//         borderRadius: "50px",
//         color: "#fff",
//         border: "none",
//     },
// };






"use client";
import React, { useContext, useEffect, useState } from "react";



import { useRouter } from "next/navigation";
import { ChatContext } from "@/app/context/chatcontext";

export default function page({ from, to, callType = "video" }) {
    const { socket, incomingUser } = useContext(ChatContext);
    const router = useRouter();

    const [dots, setDots] = useState(".");

    // Navigate to video call screen when call is accepted
    // useEffect(() => {
    //     if (setcurrenuser) {
    //         console.log("Call ongoing, navigating to video room");
    //         router.push(`/videoroom?userId=${to}`);
    //         setsetcurrenuser(null);
    //     }
    // }, [setcurrenuser, to, router, setsetcurrenuser]);

    // Calling animation dots
    useEffect(() => {
        const i = setInterval(() => {
            setDots((d) => (d.length < 3 ? d + "." : "."));
        }, 500);
        return () => clearInterval(i);
    }, []);

    const handleCancel = () => {
        socket.emit("end-call", { to, from });
        router.back();
    };

    return (
        <div style={styles.container}>
            {/* CALL TYPE ICON */}
            <div style={styles.icon}>{callType === "video" ? "📹" : "📞"}</div>

            {/* USER AVATAR */}
            <img
                src="https://placekitten.com/200/200"
                alt="avatar"
                style={styles.avatar}
            />

            {/* TEXT */}
            <div style={styles.callingText}>
                {from} is calling {to}{dots}
            </div>

            <div style={styles.subText}>
                {callType === "video" ? "Video call" : "Audio call"}
            </div>

            {/* BUTTONS */}
            <div style={styles.buttons}>
                <button style={styles.endBtn} onClick={handleCancel}>
                    📞
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        height: "100vh",
        backgroundColor: "#000",
        color: "#fff",
    },
    icon: { fontSize: 60, color: "#22C55E" },
    avatar: { width: 140, height: 140, borderRadius: "50%", border: "2px solid #22C55E" },
    callingText: { fontSize: 20, fontWeight: 600, marginTop: 10 },
    subText: { fontSize: 14, color: "#9CA3AF" },
    buttons: { marginTop: 50, display: "flex", gap: 20 },
    endBtn: {
        width: 70,
        height: 70,
        borderRadius: "50%",
        backgroundColor: "#EF4444",
        color: "#fff",
        fontSize: 24,
        border: "none",
        cursor: "pointer",
    },
};
