'use strict';
const qfs = require('qfs-compression');
const { assert } = require('console');

class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class StarRecord {
    constructor(starKey, unk1, unk2, unk3, unk4, position, unk5, flags, name, unk6, unk7, unk8, unk9, unk10, type, planetCount) {
        this.starKey = starKey;
        this.unk1 = unk1;
        this.unk2 = unk2;
        this.unk3 = unk3;
        this.unk4 = unk4;
        this.position = position;
        this.unk5 = unk5;
        this.flags = flags;
        this.name = name;
        this.unk6 = unk6;
        this.unk7 = unk7;
        this.unk8 = unk8;
        this.unk9 = unk9;
        this.unk10 = unk10;
        this.type = type;
        this.planetCount = planetCount;
    }
}

class StarParser {
    unpackStarRecordsFromDbpf(dbpf) {
        // Read the dbpf file header (96 bytes)
        const header = dbpf.slice(0, 96);
        
        // Setup index table object
        const indexTable = {
            cEntries: 0,
            cbSize: 0,
            offset: 0,
            buffer: null
        }
        
        // Iterate over header and grab values related to index table
        let i = 0;
        while (i < header.byteLength) {
            const val = header.readIntLE(i, 4);

            if (i == 36)
                indexTable.cEntries = val;
            else if (i == 44)
                indexTable.cbSize = val;
            else if (i == 64)
                indexTable.offset = val;
                
            i += 4;
        }
        
        // Read the index table bytes from the end of the file
        indexTable.buffer = dbpf.slice(indexTable.offset, indexTable.offset + indexTable.cbSize);

        // Read each individual index entry from from index table
        const indexType = indexTable.buffer.readUInt32LE(0); // read index type
        const indices = []; // init empty array of indices
        
        switch (indexType) {
            case 4:
                // Validate index table size
                assert(8 + (indexTable.cEntries * 28) == indexTable.cbSize);

                // Read each entry in index table
                for (let j = 0; j < indexTable.cEntries; j++) {
                    const offset = 8 + j * 28;
                    indices.push({
                        type:        indexTable.buffer.readUInt32LE(offset + 0),
                        group:       indexTable.buffer.readUInt32LE(offset + 4),
                        instance:    indexTable.buffer.readUInt32LE(offset + 8),
                        chunkOffset: indexTable.buffer.readUInt32LE(offset + 12),
                        diskSize:    indexTable.buffer.readUInt32LE(offset + 16),
                        memSize:     indexTable.buffer.readUInt32LE(offset + 20),
                        compressed:  indexTable.buffer.readUInt16LE(offset + 21),
                        unknown:     indexTable.buffer.readUInt16LE(offset + 26)
                    });
                }
                break;

            case 5:
            case 6:
                // Validate index table size
                assert(12 + (indexTable.cEntries * 24) == indexTable.cbSize);

                // Read each entry in index table
                for (let i = 0; i < entryCount; i++) {
                    const offset = 12 + i * 24;
                    indices.push({
                        group:       indexTable.buffer.readUInt32LE(offset),
                        instance:    indexTable.buffer.readUInt32LE(offset + 4),
                        chunkOffset: indexTable.buffer.readUInt32LE(offset + 8),
                        diskSize:    indexTable.buffer.readUInt32LE(offset + 12),
                        memSize:     indexTable.buffer.readUInt32LE(offset + 16),
                        compressed:  indexTable.buffer.readUInt16LE(offset + 20),
                        unknown:     indexTable.buffer.readUInt16LE(offset + 22)
                    });
                }
                break;

            case 7:
                // Validate index table size
                assert(16 + (indexTable.cEntries * 20) == indexTable.cbSize);

                // Read each entry in index table
                for (let i = 0; i < entryCount; i++) {
                    const offset = 16 + i * 20; // calculate the offset for each entry
                    indices.push({
                        instance:    indexTable.buffer.readUInt32LE(offset),
                        chunkOffset: indexTable.buffer.readUInt32LE(offset + 4),
                        diskSize:    indexTable.buffer.readUInt32LE(offset + 8),
                        memSize:     indexTable.buffer.readUInt32LE(offset + 12),
                        compressed:  indexTable.buffer.readUInt16LE(offset + 16),
                        unknown:     indexTable.buffer.readUInt16LE(offset + 18)
                    });
                }
                break;

            default:
                console.log('Invalid index type');
                break;
        }
        
        // Read and decompress each packed resource from its index
        let decompressedData = null;
        indices.forEach(index => {
            // Skip the resource if it is not the cStarRecord data
            if (index.type != 0x3E4353C) return;

            // Read the resource data from the dbfs buffer
            const resourceData = dbpf.slice(index.chunkOffset, index.chunkOffset + index.diskSize);
            try {
                decompressedData = qfs.decompress(resourceData);
            } catch (e) {
                console.log("The following error occured while decompressing the resource file:\n", e);
            }
        });

        return decompressedData;
    }

    deserializeStarRecords(starRecordsBuffer) {
        //console.log(typeof starRecordsBuffer, starRecordsBuffer);
        let stars = [];
        
        let index = 0;
        while (index < starRecordsBuffer.byteLength) {
            const starKey = starRecordsBuffer.readIntBE(index, 4); // probably not actually starkey
            index += 4

            // Read unknown values
            const unk1 = starRecordsBuffer.readIntBE(index, 4);
            const unk2 = starRecordsBuffer.readIntBE(index + 4, 4);
            const unk3 = starRecordsBuffer.readIntBE(index + 8, 4);
            const unk4 = starRecordsBuffer.readIntBE(index + 12, 4);
            index += 16;
            
            // Skip bytes
            index += 116;

            // Read star position (3 floats)
            const x = starRecordsBuffer.readFloatBE(index);
            const y = starRecordsBuffer.readFloatBE(index + 4);
            const z = starRecordsBuffer.readFloatBE(index + 8);
            index += 12;

            const position = new Vector3(x, y, z);

            // Read more unk values
            const unk5 = starRecordsBuffer.readIntBE(index, 4);
            index += 4;

            // Read star flags (4-bytes)
            const flags = starRecordsBuffer.readIntBE(index, 4);
            index += 4;

            // Read name length (4-byte int)
            const nameLen = starRecordsBuffer.readIntBE(index, 4);
            index += 4;

            // Read name (utf16le string)
            const nameBuffer = starRecordsBuffer.slice(index, index + nameLen * 2);
            const name = nameBuffer.toString('utf16le');
            index += nameLen * 2;

            // Read more unk vaules
            const unk6 = starRecordsBuffer.readIntBE(index, 4);
            const unk7 = starRecordsBuffer.readIntBE(index + 4, 4);
            const unk8 = starRecordsBuffer.readIntBE(index + 8, 4);
            const unk9 = starRecordsBuffer.readIntBE(index + 12, 4);
            const unk10 = starRecordsBuffer.readIntBE(index + 16, 4);
            index += 20;
            
            // Read star type (4-byte int)
            const type = starRecordsBuffer.readIntBE(index, 4);
            index += 4;
            
            // Skip rest of the bytes
            index += 52

            // Read planet count (1-byte int)
            const planetCount = starRecordsBuffer.readIntBE(index, 1);
            index += 1;

            let star = new StarRecord(starKey, unk1, unk2, unk3, unk4, position, unk5, flags, name, unk6, unk7, unk8, unk9, unk10, type, planetCount);
            stars.push(star);
        }
        return stars;
    }
}

module.exports = StarParser;
