import { deflateRawSync } from 'node:zlib';
/** Tiny, finite fixtures allow hostile central/local names without extracting them. */
export function makeZip(files) {
  const locals = [];
  const records = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name);
    const localName = Buffer.from(file.localName ?? file.name);
    const bytes = Buffer.from(file.bytes ?? 'fixture');
    const method = file.deflate ? 8 : 0;
    const packed = method ? deflateRawSync(bytes) : bytes;
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(packed.length, 18);
    local.writeUInt32LE(bytes.length, 22);
    local.writeUInt16LE(localName.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50);
    central.writeUInt16LE(method, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(packed.length, 20);
    central.writeUInt32LE(file.size ?? bytes.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE((file.mode ?? 0o100644) * 65536, 38);
    central.writeUInt32LE(offset, 42);
    const entry = Buffer.concat([local, localName, packed]);
    locals.push(entry);
    records.push(central, name);
    offset += entry.length;
  }
  const directory = Buffer.concat(records);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}
