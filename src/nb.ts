import makeWASocket, { useMultiFileAuthState, makeCacheableSignalKeyStore, makeInMemoryStore, DisconnectReason, Browsers, jidNormalizedUser, WASocket, WAProto } from "baileys";
import P, { Logger } from "pino";
import { Boom } from "@hapi/boom";
import NodeCache from "node-cache";
import * as enquirer from "enquirer";
import * as MessageManager from "./manager";
import { ExpandedSocket } from "./types"
import { ExpandSocket } from "./libs"

const logger: Logger = P({ timestamp: () => `,"time":"${new Date().toJSON()}"` }, P.destination('../cache/wa-logs.txt')).child({class: "baileys"});

const store: ReturnType<typeof makeInMemoryStore> = makeInMemoryStore({ logger });

store.readFromFile('../cache/baileys_store.json');

setInterval(() => {
	store.writeToFile('../cache/baileys_store.json');
}, 10000);

const msgRetryCounterCache = new NodeCache();

async function startSocket(): Promise<void> {
  
  const { state, saveCreds } = await useMultiFileAuthState(`../cache/session`);

  const nbs: ExpandedSocket = ExpandSocket(makeWASocket({
    logger,
    printQRInTerminal: false,
    auth: {
         creds: state.creds,
         keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
    browser: Browsers.windows("Chrome"),
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    msgRetryCounterCache,
    defaultQueryTimeoutMs: undefined, // for this issues https://github.com/WhiskeySockets/Baileys/issues/276
    getMessage
  }), store);
  
  nbs.ev.on("creds.update", saveCreds)
  
  nbs.ev.on("connection.update", async (update) => {
    const { lastDisconnect, connection } = update
    if (connection) {
       console.info(`Connection Status : ${connection}`)
       console.info(`Status Koneksi : ${connection}`)
    }

    if (connection === "close") {
      let reason = new Boom(lastDisconnect?.error)?.output.statusCode
      if (reason === DisconnectReason.badSession) {
        console.error(`Bad Session File, Please Delete Session and Scan Again`)
        console.error(`File Sesi Buruk, Tolong Hapus Sesi Dan Pindai ulang`)
        process.send!('reset')
      } else if (reason === DisconnectReason.connectionClosed) {
        console.error("Connection closed, reconnecting....")
        console.error("Koneksi tertutup, sedang menyambungkan ulang....")
        await startSocket()
      } else if (reason === DisconnectReason.connectionLost) {
        console.error("connection lost from server, reconnecting...")
        console.error("Koneksi hilang dari server, sedang menyambungkan ulang...")
        await startSocket()
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.error("Connection Replaced, Another New Session Opened, Please Close Current Session First")
        console.error("Koneksi Tertimpa, Sesi Baru Yang Lain Telah Terbuka, Tolong Tutup Dulu Sesi Tersebut")
        process.exit(1)
      } else if (reason === DisconnectReason.loggedOut) {
        console.error(`Device Logged Out, Please Scan Again And Run.`)
        console.error(`Perangkat Telah Keluar, Tolong Pindai Ulang Dan Jalankan.`)
        process.exit(1)
      } else if (reason === DisconnectReason.restartRequired) {
        console.error("Restart Required, Restarting...")
        console.error("Pemulaian Ulang Dibutuhkan, Memulai Ulang...")
        await startSocket()
      } else if (reason === DisconnectReason.timedOut) {
        console.error("Connection TimedOut, Reconnecting...")
        console.error("Waktu Koneksi Telah Habis, Menyambungkan Ulang...")
        process.send!('reset')
      } else {
        console.error(reason)
        process.send!('reset')
      }
    }
    
    if (connection === "open" && process.argv.includes("--testSend")) {
      nbs.sendMessage(global.config.getValue("ownerNumbers")[0] + "@s.whatsapp.net", {
          text: `${nbs?.user?.name || "Noura"} has Connected to account`,
      })
    }
  })
  
  
}

async function getMessage(key: WAProto.IMessageKey): Promise<WAProto.IMessage | undefined> {
  if (key) {
    const jid = jidNormalizedUser(key.remoteJid!)
    const msg = await store?.loadMessage(jid!,key.id!)
    
    return msg?.message || undefined
  }
  
	return WAProto.Message.fromObject({})
}