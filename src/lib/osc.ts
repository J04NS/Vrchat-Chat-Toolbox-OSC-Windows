/**
 * OSC (Open Sound Control) 1.0 Packet Builder for VRChat Chatbox
 * Fully compliant with standard 4-byte boundary padding.
 */

function pad4(len: number): number {
  const rem = len % 4;
  return rem === 0 ? 0 : 4 - rem;
}

function writePaddedString(str: string): Uint8Array {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const nullCount = 1 + pad4(bytes.length + 1); // at least 1 null byte, then pad to 4 bytes
  const total = bytes.length + nullCount;
  const out = new Uint8Array(total);
  out.set(bytes, 0);
  // Rest are already 0s
  return out;
}

/**
 * Encodes a VRChat Chatbox message:
 * Address: "/chatbox/input"
 * Args:
 * - text (string)
 * - bypassTyping (boolean)
 * - playSound (boolean)
 */
export function encodeVRChatChatboxInput(
  text: string,
  bypassTyping: boolean = true,
  playSound: boolean = false
): Uint8Array {
  // OSC Address
  const addrBytes = writePaddedString('/chatbox/input');

  // OSC Type tag: Using 'T' or 'F' (True/False OSC type tags) which require 0 payload bytes in OSC 1.0
  const typeTagStr = `,s${bypassTyping ? 'T' : 'F'}${playSound ? 'T' : 'F'}`;
  const typeTagBytes = writePaddedString(typeTagStr);

  // Payload: text string padded
  const textBytes = writePaddedString(text);

  const totalLen = addrBytes.length + typeTagBytes.length + textBytes.length;
  const packet = new Uint8Array(totalLen);

  let offset = 0;
  packet.set(addrBytes, offset);
  offset += addrBytes.length;

  packet.set(typeTagBytes, offset);
  offset += typeTagBytes.length;

  packet.set(textBytes, offset);
  offset += textBytes.length;

  return packet;
}

/**
 * Encodes VRChat Chatbox typing indicator:
 * Address: "/chatbox/typing"
 * Args: [typing: boolean]
 */
export function encodeVRChatChatboxTyping(typing: boolean): Uint8Array {
  const addrBytes = writePaddedString('/chatbox/typing');
  const typeTagBytes = writePaddedString(typing ? ',T' : ',F');
  const totalLen = addrBytes.length + typeTagBytes.length;
  const packet = new Uint8Array(totalLen);
  packet.set(addrBytes, 0);
  packet.set(typeTagBytes, addrBytes.length);
  return packet;
}

export interface DecodedOscPacket {
  address: string;
  args: any[];
}

/**
 * Decodes incoming OSC buffers, supporting both single messages and OSC bundles (#bundle).
 * VRChat groups avatar parameter updates into #bundle packets on UDP 9001.
 */
export function decodeOscPackets(buf: Uint8Array | Buffer): DecodedOscPacket[] {
  const results: DecodedOscPacket[] = [];
  if (!buf || buf.length < 4) return results;

  try {
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

    // Check if packet is an OSC Bundle: starts with "#bundle\0" (8 bytes)
    if (buf.length >= 16) {
      let isBundle = true;
      const bundleHeader = [35, 98, 117, 110, 100, 108, 101, 0]; // "#bundle\0"
      for (let i = 0; i < 8; i++) {
        if (buf[i] !== bundleHeader[i]) {
          isBundle = false;
          break;
        }
      }

      if (isBundle) {
        // Offset 16: after 8 bytes bundle tag + 8 bytes timetag
        let offset = 16;
        while (offset + 4 <= buf.length) {
          const elemSize = view.getInt32(offset, false);
          offset += 4;
          if (elemSize <= 0 || offset + elemSize > buf.length) break;
          const subBuf = buf.subarray(offset, offset + elemSize);
          const subPackets = decodeOscPackets(subBuf);
          results.push(...subPackets);
          offset += elemSize;
        }
        return results;
      }
    }

    // Single OSC Message decoding
    let offset = 0;
    let nullIdx = -1;
    for (let i = offset; i < buf.length; i++) {
      if (buf[i] === 0) {
        nullIdx = i;
        break;
      }
    }
    if (nullIdx === -1) return results;

    const address = new TextDecoder().decode(buf.subarray(offset, nullIdx));
    offset = nullIdx + 1;
    while (offset % 4 !== 0 && offset < buf.length) offset++;

    if (offset >= buf.length || buf[offset] !== 44 /* ',' */) {
      results.push({ address, args: [] });
      return results;
    }

    // Read type tags
    let typeTagNull = -1;
    for (let i = offset; i < buf.length; i++) {
      if (buf[i] === 0) {
        typeTagNull = i;
        break;
      }
    }
    if (typeTagNull === -1) {
      results.push({ address, args: [] });
      return results;
    }

    const typeTags = new TextDecoder().decode(buf.subarray(offset + 1, typeTagNull));
    offset = typeTagNull + 1;
    while (offset % 4 !== 0 && offset < buf.length) offset++;

    const args: any[] = [];
    for (const tag of typeTags) {
      if (tag === 'T') {
        args.push(true);
      } else if (tag === 'F') {
        args.push(false);
      } else if (tag === 'i') {
        if (offset + 4 <= buf.length) {
          args.push(view.getInt32(offset, false));
          offset += 4;
        }
      } else if (tag === 'f') {
        if (offset + 4 <= buf.length) {
          args.push(view.getFloat32(offset, false));
          offset += 4;
        }
      } else if (tag === 's') {
        let strNull = -1;
        for (let i = offset; i < buf.length; i++) {
          if (buf[i] === 0) {
            strNull = i;
            break;
          }
        }
        if (strNull !== -1) {
          args.push(new TextDecoder().decode(buf.subarray(offset, strNull)));
          offset = strNull + 1;
          while (offset % 4 !== 0 && offset < buf.length) offset++;
        }
      }
    }

    results.push({ address, args });
    return results;
  } catch {
    return results;
  }
}

/**
 * Decodes an incoming OSC message, returning the first message or null.
 */
export function decodeOscMessage(buf: Uint8Array | Buffer): DecodedOscPacket | null {
  const packets = decodeOscPackets(buf);
  return packets.length > 0 ? packets[0] : null;
}
