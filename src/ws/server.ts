import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import type { Commentary, Match } from "../db/schema.ts";

type AppWebSocket = WebSocket & {
    isAlive: boolean;
    subscriptions: Set<number>;
};

function asAppSocket(socket: WebSocket): AppWebSocket {
    return socket as AppWebSocket;
}

const matchSubscribers = new Map<number, Set<WebSocket>>();

function subscribeToMatch(matchId: number, socket: WebSocket) {
    if(!matchSubscribers.has(matchId)) {
        matchSubscribers.set(matchId, new Set());
    }
    matchSubscribers.get(matchId)?.add(socket);
}

function unsubscribeFromMatch(matchId: number, socket: WebSocket) {
    const subscribers = matchSubscribers.get(matchId);
    if(!subscribers) {
        return;
    }
    subscribers.delete(socket);
    if(subscribers.size === 0) {
        matchSubscribers.delete(matchId);
    }
}


function cleanupMatchSubscriptions(socket: AppWebSocket){
    for(const matchId of socket.subscriptions){
        unsubscribeFromMatch(matchId, socket);
    }
    socket.subscriptions.clear();
}

function parseMatchId(value: unknown): number | null {
    if (typeof value !== 'string' && typeof value !== 'number') {
        return null;
    }
    const matchId = Number(value);
    if (!Number.isInteger(matchId) || matchId <= 0) {
        return null;
    }
    return matchId;
}

function handleMessage(socket: AppWebSocket, data: Object) {
    let message;
    try{
        message = JSON.parse(data.toString());
    } catch (error) {
        sendJson(socket, { type: 'error', message: 'Invalid JSON' });
        return;
    }

    const matchId = parseMatchId(message.matchId);

    if(message.type === 'subscribe' && matchId !== null) {
        subscribeToMatch(matchId, socket);
        socket.subscriptions.add(matchId);
        sendJson(socket, { type: 'subscribed', matchId, message: 'Subscribed to match' });
    } else if(message.type === 'unsubscribe' && matchId !== null) {
        unsubscribeFromMatch(matchId, socket);
        socket.subscriptions.delete(matchId);
        sendJson(socket, { type: 'unsubscribed', matchId, message: 'Unsubscribed from match' });
    } else {
        sendJson(socket, { type: 'error', message: 'Invalid message' });
    }
}

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

function broadcastToAll(wss: WebSocketServer,payload: Object) {
    for(const client of wss.clients ){
        if(client.readyState !== WebSocket.OPEN) {
            continue; // Skip the client if it is not open
        }
        client.send(JSON.stringify(payload));
    }
}

function broadcastToMatch(matchId: number, payload: Object) {
    const subscribers = matchSubscribers.get(matchId);
    if(!subscribers || subscribers.size === 0) {
        return;
    }
    for(const client of subscribers) {
        if(client.readyState !== WebSocket.OPEN) {
            continue;
        }
        try{
            sendJson(client, payload);
        } catch (error) {
            console.error(error);
        }
    }
}



export function attachWebSocketServer(server: Server){
    const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 1024 * 1024 * 10 }); // Create a new WebSocket server and attach it to the express server

    wss.on('connection', (socket) => {
        const client = asAppSocket(socket);
        client.isAlive = true;
        client.subscriptions = new Set();
        client.on('pong', () => { client.isAlive = true; });

        sendJson(client, { type: 'welcome', message: 'Welcome to the WebSocket server' });


        socket.on('message', (data) => {
            handleMessage(client, data);
        });

        socket.on('error', (error) => {
            socket.terminate();
        });

        socket.on('close', () => {
            cleanupMatchSubscriptions(client);
        });

        client.on('error', console.error);
    });

    const interval = setInterval(() => {
        for (const ws of wss.clients) {
            const client = asAppSocket(ws);
            if (client.isAlive === false) {
                client.terminate();
                continue;
            }
            client.isAlive = false;
            client.ping();
        }
    }, 30000);

    wss.on('close', () => {
        clearInterval(interval);
    });

    wss.on('error', (error) => {
        console.error('WebSocket server error:', error);
    });


    function broadcastMatchCreated(match: Match) {
        broadcastToAll(wss, { type: 'match_created', match });
    }


    function broadcastCommentaryCreated(matchId: number, commentary: Commentary) {
        broadcastToMatch(matchId, {type: 'commentary_created', data:commentary});
    }

    return { broadcastMatchCreated, broadcastCommentaryCreated };
}
