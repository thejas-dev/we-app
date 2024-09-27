import { io } from 'socket.io-client';

const server = "http://192.168.109.96:3333"
// "https://weapp-server.onrender.com"
// "https://weapp-server.vercel.app";

export const socket = io(server, {
    withCredentials: true,
    extraHeaders: {
        "Access-Control-Allow-Origin": "*",
        "my-custom-header": "abcd"
    },
    reconnection: true,             // Enable reconnection
    reconnectionAttempts: Infinity, // Maximum attempts, Infinity means unlimited
    reconnectionDelay: 1000,        // Initial delay before first reconnection attempt (in ms)
    reconnectionDelayMax: 5000,     // Maximum delay between reconnection attempts (in ms)
    randomizationFactor: 0.5,       // Randomization factor for reconnection delay
    timeout: 5000,                 // Connection timeout (in ms)
    transports: ['websocket'],      // Use only WebSocket transport
    autoConnect: true               // Automatically connect on initialization
});
