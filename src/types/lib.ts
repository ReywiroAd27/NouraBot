import { WAMessageContent, WAProto as proto, GroupMetadata, GroupParticipant, WASocket, makeInMemoryStore } from "baileys";

export interface Serial {
  message: WAMessageContent,
  senderKey: proto.IMessageKey | {},
  from: string,
  fromMe: boolean,
  id?: string,
  device?: "android" | "unknown" | "web" | "ios" | "desktop",
  senderName?: string,
  senderId?: string,
  isSystem: boolean,
  isGroup: boolean,
  isParticipant: boolean,
  isOwner: boolean,
  groupMeta: GroupMetadata | {},
  groupAdmins: GroupParticipant[],
  isGroupAdmin: boolean,
  isBotGroupAdmin: boolean,
  isGroupOwner: boolean,
  isComunity: boolean,
  messageType: string,
  messageContent: WAMessageContent | {},
  isNativeFlow: boolean,
  isPolling: boolean,
  isMedia: boolean,
  isAnimated?: boolean,
  timestamp: number,
  expiration: number,
  textBody: string,
  argv: string[],
  mediaType?: string,
  mediaWidth?: string,
  mediaHeight?: string,
  mediaSize?: number,
  poll?: proto.Message.IPollEncValue,
  nativeFlowResponse?: proto.INativeFlowResponse,
}

export type ExpandedSocket = WASocket & {
  store: ReturnType<typeof makeInMemoryStore>
  getContentType: (message: WAMessageContent) => string | undefined,
  decodeJid: (jid: string) => string,
}