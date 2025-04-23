import { Server as IOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "@/types/next.d.ts";

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (req.method !== "GET") {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  if (!res.socket.server.io) {
    console.log("🔌 Initializing Socket.io server...");

    const httpServer: HTTPServer = res.socket.server as HTTPServer;
    const io = new IOServer(httpServer, {
      path: "/api/socketio",
    });

    io.on("connection", (socket) => {
      console.log("✅ Socket connected:", socket.id);

      socket.on("bid", (data) => {
        console.log("📨 New bid:", data);
        socket.broadcast.emit("new-bid", data);
      });

      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }

  res.status(200).json({ message: "Socket server running" });
}
