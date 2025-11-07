// "use client";
// import React, { useState, useEffect } from "react";

// export default function Page() {
//     const [show, setShow] = useState(false);

//     useEffect(() => {
//         // Page load hone par notification show karo
//         setShow(true);

//         // 3 second baad hide ho jaaye
//         const timer = setTimeout(() => {
//             setShow(false);
//         }, 3000);

//         return () => clearTimeout(timer);
//     }, []);

//     const dummyNotification = {
//         name: "Rohit Sharma",
//         message: "Hey! What's up? 😄",
//         avatar:
//             "https://i.pravatar.cc/150?img=3", // dummy user image
//     };

//     return (
//         <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
//             <h1 className="text-xl font-semibold mb-4">Next.js Instagram-Style Notification</h1>

//             <button
//                 onClick={() => {
//                     setShow(true);
//                     setTimeout(() => setShow(false), 3000);
//                 }}
//                 className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
//             >
//                 Show Notification
//             </button>

//             {show && (
//                 <Notification
//                     name={dummyNotification.name}
//                     message={dummyNotification.message}
//                     avatar={dummyNotification.avatar}
//                 />
//             )}
//         </div>
//     );
// }

// export function Notification({ name, message, avatar }) {
//     return (
//         <div
//             className="fixed top-5 left-1/2 transform -translate-x-1/2 
//       bg-white border-l-4 border-pink-500 shadow-lg rounded-xl 
//       px-4 py-3 w-[90vw] max-w-md text-gray-800 text-sm font-medium 
//       flex items-center gap-3 animate-slide-down z-[9999]"
//         >
//             <img
//                 src={avatar}
//                 alt={name}
//                 className="w-10 h-10 rounded-full object-cover border border-gray-200"
//             />
//             <div className="flex flex-col">
//                 <span className="font-semibold text-gray-900">{name}</span>
//                 <span className="text-gray-700">{message}</span>
//             </div>
//         </div>
//     );
// }

// // Add this animation in your global.css (or tailwind config me extend karo)
// /*
// @keyframes slideDown {
//   0% {
//     transform: translate(-50%, -100%);
//     opacity: 0;
//   }
//   100% {
//     transform: translate(-50%, 0);
//     opacity: 1;
//   }
// }
// .animate-slide-down {
//   animation: slideDown 0.4s ease-out;
// }
// */










import { View, Text } from 'react-native'
import React from 'react'

const page = () => {
    return (
        <View>
            <Text>page</Text>
        </View>
    )
}

export default page