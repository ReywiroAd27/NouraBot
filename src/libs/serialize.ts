import {
    prepareWAMessageMedia,
    jidNormalizedUser,
    proto,
    areJidsSameUser,
    extractMessageContent,
    generateWAMessageFromContent,
    downloadContentFromMessage,
    toBuffer,
    getDevice,
    WAMessage
} from "baileys";
import { Serial, ExpandedSocket } from "../types";

type vl = string|number|boolean
export default async function Serialize(socket: ExpandedSocket, msg: WAMessage) {
  if (!msg.message) return;
  
  if (msg.key && msg.key.remoteJid == "status@broadcast") return;
  
  const M: Serial = {
    message: extractMessageContent(msg.message),
    senderKey: msg?.key ?? {}
  },
  botNumber = socket.user?.id && (socket.decodeJid(socket.user.id) || socket.user.id) || undefined;
  
  M["from"] = M.senderKey?.remoteJid && socket.decodeJid(M.senderKey.remoteJid) || "";
  M["fromMe"] = M.senderKey?.fromMe ?? false;
  M["id"] = M.senderKey?.id;
  M["device"] = M.id && getDevice(M.id) || undefined;
  M["isSystem"] = M.ìd && M.id.startsWith("BAE5");
  M["isGroup"] = M.from && M.from.startsWith("BAE5");
  M["isParticipant"] = M.isGroup && !!M.senderKey?.participant;
  M["senderId"] = socket.decodeJid(M.fromMe && socket.user?.id || M.isGroup && M.senderKey?.participant || M.from) || undefined;
  M["senderName"] = msg?.pushName;
  M["isOwner"] = m.senderId && [botNumber.split`@`[0]].includes(M.senderId.replace(/\D+/g));
  M["groupMeta"] = M.isGroup && m.from && await socket.groupMetadata(m.from) || {};
  M["groupAdmins"] = M.groupMeta?.participants && M.groupMeta.participants.filter(member=>member.admin);
  M["isGroupAdmin"] = M.isGroup && M.admins.length > 0 && !!M.admins.find(admin=>admin.id==M.senderId);
  M["isBotGroupAdmin"] = M.isGroup && M.admins.length > 0 && !!M.admins.find(admin=>admin.id==botNumber);
  M["isGroupOwner"] = M.isGroup && M.admins.length > 0 && !!M.admins.find(admin=>admin.id==botNumber&&admìn.isSuperAdmin);
  M["isCommunity"] = M.isGroup && M.admins.length > 0 && !!M.groupMeta?.isCommunity;
  
  M["messageType"] = M.message && (socket.getContentType(M.message) || Object.keys(M.message)[0]) || undefined;
  M["messageContent"] = M.message && (extractMessageContent(M.message[M.messageType]) || M.message[M.messageType]) || {};
  M["isNativeFlow"] = !!M.messageContent?.nativeFlowResponseMessage
  M["isPolling"] = !!M.messageContent?.vote
  M["nativeFlowResponse"] = isNativeFlow && M.messageContent?.nativeFlowResponseMessage || undefined;
  M["poll"] = isPolling && M.messageContent?.vote || undefined;
  M["mentions"] = (M.messageContent?.contextInfo || {})?.mentionedJid;
  M["textBody"] = M.messageContent?.text ||
    M.messageContent?.conversation ||
    M.messageContent?.caption ||
    M.message?.conversation ||
    M.messageContent?.selectedButtonId ||
    M.messageContent?.singleSelectReply?.selectedRowId ||
    M.messageContent?.selectedId ||
    M.messageContent?.contentText ||
    M.messageContent?.selectedDisplayText ||
    M.messageContent?.title ||
    M.messageContent?.name ||
    "";
  M["argv"] = M.textBody.match(/".+"|'.+'|[^ ]+/g).map(i=>i.replace(/^("|')|("|')$/g,""));
  M["expiration"] = M.messageContent?.contextInfo?.expiration || 0;
  M["timestamp"] = typeof msg.messageTimestamp === "number"
    && msg.messageTimestamp
    || msg.messageTimestamp.low
    || msg.messageTimestamp.high || m.msg.timestampMs * 1000;
  M["isMedia"] = !!M.messageContent?.mimetype || !!M.messageContent?.thumbnailDirectPath
  M["mediaType"] = M.isMedia && M.messageContent?.mimetype || undefined
  M["mediaSize"] = M.isMedia && M.messageContent?.fileLength || undefined
  M["mediaHeight"] = M.isMedia && (M.messageContent?.height || "") || undefined
  M["mediaWidth"] = M.isMedia && (M.messageContent?.width || "") || undefined
  M["isAnimated"] = M.isMedia ? M.messageContent?.isAnimated : undefined
}
  
/*async function s() {
    const m: Record<string, vl|vl[]|Record<string, vl|vl[]|Record<string,vl|vl[]>> = {};
    const botNumber = socket.decodeJid(socket.user?.id);
    const prefix = RegExp("^[" + config.options.prefix + "^]", "i");
    // ignore those that don't contain messages
    if (!msg.message) return;
    //Ignore msg from status
    if (msg.key && msg.key.remoteJid == "status@broadcast") return;
    m.message = extractMessageContent(msg.message);
    m.key = msg?.key ?? {};
    m.from = m.key?.remoteJid ? socket.decodeJid(m.key.remoteJid) : "";
    m.fromMe = m.key?.fromMe ?? false;
    m.id = m.key?.id ?? "";
    m.device = m.id !== "" ? getDevice(m.id) : null;
    m.isBaileys = m.id.startsWith("BAE5");
    m.isGroup = m.from.endsWith("@g.us");
    m.participant = !m.isGroup ? false : m.key.participant;
    m.sender = m.from !== "" ? socket.decodeJid(
        m.fromMe ? socket.user.id : m.isGroup ? m.participant : m.from
    ) : "";

    m.pushName = msg?.pushName;
    m.isOwner =
        m.sender &&
        [...config.options.owner, botNumber.split`@`[0]].includes(
            m.sender.replace(/\D+/g, "")
        );

    m.metadata = m.isGroup ? await socket.groupMetadata(m.from) : {};
    m.admins = m.metadata?.participants && m.metadata.participants.reduce(
        (memberAdmin, memberNow) =>
            (memberNow.admin
                ? memberAdmin.push({
                      id: memberNow.id,
                      admin: memberNow.admin
                  })
                : [...memberAdmin]) && memberAdmin,
        []
    );
    m.isAdmin = m.admins && !!m.admins.find(member => member.id === m.sender);
    m.isBotAdmin = m.admins && !!m.admins.find(member => member.id === botNumber)

    if (m.message) {
        m.type = socket.getContentType(m.message) || Object.keys(m.message)[0];
        m.msg = extractMessageContent(m.message[m.type]) || m.message[m.type];
        m.nrf = m.msg?.nativeFlowResponseMessage;
        m.poll = m.msg?.vote;
        if (m.poll) {
            m.vote = {};
            m.vote.payload = m.poll.encPayload;
            m.vote.Iv = m.poll.encIv;
        }
        if (m.nrf) {
            m.nrfName = m.nrf.name;
            m.nrfParams = m.nrf.paramsJson;
        }
        m.mentions = m.msg?.contextInfo?.mentionedJid || [];
        m.body =
            m.msg?.text ||
            m.msg?.conversation ||
            m.msg?.caption ||
            m.message?.conversation ||
            m.msg?.selectedButtonId ||
            m.msg?.singleSelectReply?.selectedRowId ||
            m.msg?.selectedId ||
            m.msg?.contentText ||
            m.msg?.selectedDisplayText ||
            m.msg?.title ||
            m.msg?.name ||
            "";
        m.prefix = prefix.test(m.body) ? m.body.match(prefix)[0] : "#";
        m.command =
            m.b.ody && m.body.replace(m.prefix, "").trim().split(/ +/).shift();
        m.args = m.body
            .trim()
            .replace(new RegExp("^" + Func.escapeRegExp(m.prefix), "i"), "")
            .replace(m.command, "")
            .split(/ +/)
            .filter(a => a) || ["", "", ""];
        m.text = m.args.join(" ");
        m.expiration = m.msg?.contextInfo?.expiration || 0;
        m.timestamp =
            (typeof msg.messageTimestamp === "number"
                ? msg.messageTimestamp
                : msg.messageTimestamp.low
                ? msg.messageTimestamp.low
                : msg.messageTimestamp.high) || m.msg.timestampMs * 1000;
        m.isMedia = !!m.msg?.mimetype || !!m.msg?.thumbnailDirectPath;
        if (m.isMedia) {
            m.mime = m.msg?.mimetype;
            m.size = m.msg?.fileLength;
            m.height = m.msg?.height || "";
            m.width = m.msg?.width || "";
            if (/webp/i.test(m.mime)) {
                m.isAnimated = m.msg?.isAnimated;
            }
        }
    }
    m.reply = async (text, options = {}) => {
        let chatId = options?.from ? options.from : m.from;
        let quoted = options?.quoted ? options.quoted : m;

        if (
            Buffer.isBuffer(text) ||
            /^data:.?\/.*?;base64,/i.test(text) ||
            /^https?:\/\//.test(text) ||
            fs.existsSync(text)
        ) {
            let data = await Func.getFile(text);
            if (
                !options.mimetype &&
                (/utf-8|json/i.test(data.mime) ||
                    data.ext == ".bin" ||
                    !data.ext)
            ) {
                if (!!config.msg[text]) text = config.msg[text];
                return socket.sendMessage(
                    chatId,
                    {
                        text,
                        mentions: [m.sender, ...socket.parseMention(text)],
                        ...options
                    },
                    {
                        quoted,
                        ephemeralExpiration: m.expiration,
                        ...options
                    }
                );
            } else {
                return socket.sendMedia(m.from, data.data, quoted, {
                    ephemeralExpiration: m.expiration,
                    ...options
                });
            }
        } else {
            if (!!config.msg[text]) text = config.msg[text];
            return socket.sendMessage(
                chatId,
                {
                    text,
                    mentions: [m.sender, ...socket.parseMention(text)],
                    ...options
                },
                {
                    quoted,
                    ephemeralExpiration: m.expiration,
                    ...options
                }
            );
        }
    };
    m.download = filepath => {
        if (filepath) return socket.downloadMediaMessage(m, filepath);
        else return socket.downloadMediaMessage(m);
    };
    m.react = icon => {
        socket.sendMessage(m.from, {
            react: {
                text: icon,
                key: m.key
            }
        });
    };
    m.sendText = (text, options = {}, options2 = {}) => {
        //options
        const id = options.from ? options.from : m.from;
        const thumbnail = options.thumbnail
            ? typeof options.thumbnail === "object"
                ? !Array.isArray(options.thumbnail) &&
                  !(options.thumbnail instanceof RegExp)
                    ? options.thumbnail
                    : ""
                : typeof options.thumbnail === "boolean"
                ? options.thumbnail
                : ""
            : "";
        const thumbObj =
            typeof thumbnail !== "object"
                ? {}
                : {
                      contextInfo: {
                          title: thumbnail.title
                              ? thumbnail.title
                              : "Axelion-MD",
                          body: thumbnail.body ? thumbnail.body : ""
                      }
                  };

        return socket.sendMessage(
            id,
            {
                text,
                ...options
            },
            options2
        );
    };
    /*m.sendAdMessage = (text, opt) => {
        let ucapan = Func.ucapanWaktu();
        let target = opt && opt.froms != undefined ? opt.from : m.from;
        let imgSrc = opt && opt.thumbnail != undefined ? opt.thumbnail : "./assets/img/axel.jpeg";
        let title = opt && opt.title != undefined ? opt.title : "axelion || вѕw48";
        let mention =opt && opt.mention != undefined ? opt.mention : socket.parseMention(text);

        return socket.sendMessage(
            m.from,
            {
                text: text,
                contextInfo: {
                    mentionedJid: mention,
                    externalAdReply: {
                        title: title,
                        body: ucapan,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnail: fs.readFileSync(imgSrc),
                        sourceUrl: config.Exif.packLink,
                    }
                }
            },
            { quoted: m }
        );
    };

    m.sendAdMessageV2 = (text, opt) => {
        let target =
            opt && opt.froms != undefined
              ? opt.from : m.from;
        let imgSrc =
            opt && opt.thumbnail != undefined
                ? opt.thumbnail
                : "./assets/img/axel.jpeg";
        let title =
            opt && opt.title != undefined ? opt.title : "axelion || вѕw48";
        let mention =
            opt && opt.mention != undefined
                ? opt.mention
                : socket.parseMention(text);
        let showAdIcon = opt && opt.showAd != undefined ? opt.showAd : false;
        const ard = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`,
                ...(m.from
                    ? {
                          remoteJid: `status@broadcast`
                      }
                    : {})
            },
            message: {
                contactMessage: {
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;${p.pushname},;;;\nFN:${p.pushname},\nitem1.TEL;waid=${p.sender}:${p.sender}\nitem1.X-ABLabell:Ponsel\nEND:VCARD`,
                    displayName: m.pushname,
                    jpegThumbnail: fs.readFileSync(imgSrc),
                    thumbnail: fs.readFileSync(imgSrc),
                    sendEphemeral: true
                }
            }
        };

        return socket.sendMessage(
            m.from,
            {
                text: text,
                contextInfo: {
                    mentionedJid: mention,
                    externalAdReply: {
                        title: title,
                        body: ucapan,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnail: fs.readFileSync(imgSrc),
                        sourceUrl: config.Exif.packLink,
                        showAdAttribution: showAdIcon
                    }
                }
            },
            { quoted: ard }
        );
    };

    m.sendPayment = (text, amount, types) => {
        const type = types !== undefined ? types : "IDR";
        return socket.relayMessage(m.from, {
            requestPaymentMessage: {
                currencyCodeIso4217: type,
                amount1000: amount,
                requestFrom: "0@s.whatsapp.net",
                noteMessage: {
                    extendedTextMessage: {
                        text: text,
                        contextInfo: {
                            mentionedJid: socket.parseMention(text),
                            externalAdReply: {
                                showAdAttribution: true
                            }
                        }
                    }
                }
            }
        });
    };
    m.sendStatus = async (text, type, option) => {
      const showAdIcon = option && option.adIcon !== undefined ? option.adIcon : false
      const target = option && option.from !== undefined ? option.from : m.from
      if (type === 'failed') {
        return socket.sendMessage(
            m.from,
            {
                text: text,
                contextInfo: {
                    mentionedJid: socket.parseMention(text),
                    externalAdReply: {
                        title: '【﻿Ｆａｉｌｅｄ！！】',
                        body: '©2024 Axelion-MD',
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnail: fs.readFileSync('./assets/img/fail.jpeg'),
                        sourceUrl: "https://telegra.ph/Fail-System-02-25",
                        showAdAttribution: showAdIcon
                    }
                }
            },
            { quoted: m }
        );
      } else if (type === 'success') {
        return socket.sendMessage(
            m.from,
            {
                text: text,
                contextInfo: {
                    mentionedJid: socket.parseMention(text),
                    externalAdReply: {
                        title: '【﻿ＳＵＣＣＥＳＳ！！】',
                        body: '©2024 Axelion-MD',
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnail: fs.readFileSync('./assets/img/success.jpeg'),
                        sourceUrl: 'https://whatsapp.com/channel/0029VaF8mmq35fLmqib3Mv3R',
                        showAdAttribution: showAdIcon
                    }
                }
            },
            { quoted: m }
        );
      } else if (type === 'denied') {
        return socket.sendMessage(
            m.from,
            {
                text: text,
                contextInfo: {
                    mentionedJid: socket.parseMention(text),
                    externalAdReply: {
                        title: '【﻿ＡＣＣＥＳＳ　ＤＥＮＩＥＤ！！】',
                        body: '©2024 Axelion-MD',
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnail: fs.readFileSync('./assets/img/deniedAccess.jpeg'),
                        sourceUrl: "https://telegra.ph/Access-Denied-02-25-5",
                        showAdAttribution: showAdIcon
                    }
                }
            },
            { quoted: m }
        );
      }*/

    m.isQuoted = false;
    if (m.msg?.contextInfo?.quotedMessage) {
        m.isQuoted = true;
        m.quoted = {};
        m.quoted.message = extractMessageContent(
            m.msg?.contextInfo?.quotedMessage
        );

        if (m.quoted.message) {
            m.quoted.type =
                socket.getContentType(m.quoted.message) ||
                Object.keys(m.quoted.message)[0];
            m.quoted.msg =
                extractMessageContent(m.quoted.message[m.quoted.type]) ||
                m.quoted.message[m.quoted.type];
            m.quoted.key = {
                remoteJid: m.msg?.contextInfo?.remoteJid || m.from,
                participant: m.msg?.contextInfo?.remoteJid?.endsWith("g.us")
                    ? socket.decodeJid(m.msg?.contextInfo?.participant)
                    : false,
                fromMe: areJidsSameUser(
                    socket.decodeJid(m.msg?.contextInfo?.participant),
                    socket.decodeJid(sock?.user?.id)
                ),
                id: m.msg?.contextInfo?.stanzaId
            };
            m.quoted.nrf = m.quoted.msg?.nativeFlowResponseMessage;
            m.quoted.poll = m.msg?.vote;
            if (m.poll) {
                m.quoted.vote = {};
                m.quoted.vote.payload = m.quoted.poll.encPayload;
                m.quoted.vote.Iv = m.quoted.poll.encIv;
            }
            if (m.quoted.nrf) {
                m.quoted.nrfName = m.quoted.nrf.name;
                m.quoted.nrfParams = m.quoted.nrf.paramsJson;
            }
            m.quoted.from = m.quoted.key.remoteJid;
            m.quoted.fromMe = m.quoted.key.fromMe;
            m.quoted.id = m.msg?.contextInfo?.stanzaId;
            m.quoted.device = getDevice(m.quoted.id);
            m.quoted.isBaileys = m.quoted.id.startsWith("BAE5");
            m.quoted.isGroup = m.quoted.from.endsWith("@g.us");
            m.quoted.participant = m.quoted.key.participant;
            m.quoted.sender = socket.decodeJid(m.msg?.contextInfo?.participant);

            m.quoted.isOwner =
                m.quoted.sender &&
                [...config.options.owner, botNumber.split`@`[0]].includes(
                    m.quoted.sender.replace(/\D+/g, "")
                );
            if (m.quoted.isGroup) {
                m.quoted.metadata = await socket.groupMetadata(m.quoted.from);
                m.quoted.admins = m.quoted.metadata.participants.reduce(
                    (memberAdmin, memberNow) =>
                        (memberNow.admin
                            ? memberAdmin.push({
                                  id: memberNow.id,
                                  admin: memberNow.admin
                              })
                            : [...memberAdmin]) && memberAdmin,
                    []
                );
                m.quoted.isAdmin = !!m.quoted.admins.find(
                    member => member.id === m.quoted.sender
                );
                m.quoted.isBotAdmin = !!m.quoted.admins.find(
                    member => member.id === botNumber
                );
            }

            m.quoted.mentions = m.quoted.msg?.contextInfo?.mentionedJid || [];
            m.quoted.body =
                m.quoted.msg?.text ||
                m.quoted.msg?.caption ||
                m.quoted?.message?.conversation ||
                m.quoted.msg?.selectedButtonId ||
                m.quoted.msg?.singleSelectReply?.selectedRowId ||
                m.quoted.msg?.selectedId ||
                m.quoted.msg?.contentText ||
                m.quoted.msg?.selectedDisplayText ||
                m.quoted.msg?.title ||
                m.quoted?.msg?.name ||
                "";
            m.quoted.prefix = prefix.test(m.quoted.body)
                ? m.quoted.body.match(prefix)[0]
                : "#";
            m.quoted.command =
                m.quoted.body &&
                m.quoted.body
                    .replace(m.quoted.prefix, "")
                    .trim()
                    .split(/ +/)
                    .shift();
            m.quoted.arg =
                m.quoted.body
                    .trim()
                    .split(/ +/)
                    .filter(a => a) || [];
            m.quoted.args =
                m.quoted.body
                    .trim()
                    .replace(
                        new RegExp(
                            "^" + Func.escapeRegExp(m.quoted.prefix),
                            "i"
                        ),
                        ""
                    )
                    .replace(m.quoted.command, "")
                    .split(/ +/)
                    .filter(a => a) || [];
            m.quoted.text = m.quoted.args.join(" ");
            m.quoted.isMedia =
                !!m.quoted.msg?.mimetype || !!m.quoted.msg?.thumbnailDirectPath;
            if (m.quoted.isMedia) {
                m.quoted.mime = m.quoted.msg?.mimetype;
                m.quoted.size = m.quoted.msg?.fileLength;
                m.quoted.height = m.quoted.msg?.height || "";
                m.quoted.width = m.quoted.msg?.width || "";
                if (/webp/i.test(m.quoted.mime)) {
                    m.quoted.isAnimated = m?.quoted?.msg?.isAnimated || false;
                }
            }
            m.quoted.reply = (text, options = {}) => {
                return m.reply(text, {
                    quoted: m.quoted,
                    ...options
                });
            };
            m.quoted.download = filepath => {
                if (filepath)
                    return socket.downloadMediaMessage(m.quoted, filepath);
                else return socket.downloadMediaMessage(m.quoted);
            };
        }
    }
    return m;
};*/