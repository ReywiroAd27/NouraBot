import { WASocket, makeInMemoryStore, WAMessageContent, jidNormalizedUser452 } from "baileys";
import { ExpandedSocket } from "../types"

export default function ExpandSocket(socket: WASocket, store: ReturnType<typeof makeInMemoryStore>): ExpandedSocket {
  const stack: Record<string, Function> = {},
  addProperty = (key: string, value: Function, enumerable?: boolean = false) => (Object.defineProperty(stack, name,{value}))
  
  store.bind(socket.ev)

  addProperty("getContentType",(content: WAMessageContent)=>{
    if (content) { 
      const keys = Object.keys(content);
      const key = keys.find(k => (k === 'conversation' || k.endsWith('Message') || k.endsWith('V2') || k.endsWith('V3')) && k !== 'senderKeyDistributionMessage');
      return key;
    }
  });
  
  addProperty("decodeJid",(jid: string)=>{
    if (/:\d+@/gi.test(jid)) {
       const decode = jidNormalizedUser(jid);
       return decode;
    } else return jid;
  });
  
  // addProperty()
  
  return {...socket, ...stack, store} as ExpandedSocket;
}