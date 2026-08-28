import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import type { Match } from "../db/schema.ts";

function sendJson(socket: WebSocket, payload: Object) {
    // Check if the socket is open
    if(socket.readyState !== WebSocket.OPEN) {
        return;
    }
    try{
        socket.send(JSON.stringify(payload));
    } catch (error) {
        console.error(error);
    }
}

function broadcast(wss: WebSocketServer,payload: Object) {
    for(const client of wss.clients ){
        if(client.readyState !== WebSocket.OPEN) {
            continue; // Skip the client if it is not open
        }
        client.send(JSON.stringify(payload));
    }
}


export function attachWebSocketServer(server: Server){
    const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 1024 * 1024 * 10 }); // Create a new WebSocket server and attach it to the express server

    wss.on('connection', (socket) => {
        sendJson(socket, { type: 'welcome', message: 'Welcome to the WebSocket server' });
        socket.on('error', console.error);

    });

    wss.on('error', (error) => {
        console.error('WebSocket server error:', error);
    });


    function broadcastMatchCreated(match: Match) {
        broadcast(wss, { type: 'match_created', match });
    }

    return { broadcastMatchCreated };
}