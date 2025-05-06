import type { WASocket, BaileysEventMap as BEM } from "baileys";
import { Serialize } from "../libs"

export default function MessageManager(socket: WASocket) {
  socket.ev.on("messages.upsert", async ({ messages, type }: BEM["messages.upsert"]) => {
    if (type !== "notify") return;
    const M = Serialize(socket, messages[0])
  });
};
