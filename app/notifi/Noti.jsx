
// export function Notification({ name, message, avatar }) {
//   return (
//     <div
//       className="fixed top-5 left-1/2 transform -translate-x-1/2 
//       bg-white border-l-4 border-pink-500 shadow-lg rounded-xl 
//       px-4 py-3 w-[90vw] max-w-md text-gray-800 text-sm font-medium 
//       flex items-center gap-3 animate-slide-down z-[9999]"
//     >
//       <img
//         src={avatar}
//         alt={name}
//         className="w-10 h-10 rounded-full object-cover border border-gray-200"
//       />
//       <div className="flex flex-col">
//         <span className="font-semibold text-gray-900">{name}</span>
//         <span className="text-gray-700">{message}</span>
//       </div>
//     </div>
//   );
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

const Noti = () => {
  return (
    <View>
      <Text>Noti</Text>
    </View>
  )
}

export default Noti