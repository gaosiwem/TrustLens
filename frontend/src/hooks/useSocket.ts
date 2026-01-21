"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function useSocket(userId?: string) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Initialize socket connection
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000", {
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        console.log("Socket connected");
        setConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
        setConnected(false);
      });
    }

    // Join user's notification room
    socket.emit("join", userId);

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
      }
    };
  }, [userId]);

  return { socket, connected };
}

export function getSocket() {
  return socket;
}
