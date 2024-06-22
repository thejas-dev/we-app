import { io } from 'socket.io-client';

const server = "http://192.168.1.9:3333";
export const socket = io(server, {
    withCredentials: true,
    extraHeaders: {
        "Access-Control-Allow-Origin": "http://192.168.1.9:3000",
        "my-custom-header": "abcd"
    }
});
