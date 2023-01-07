const fs = require('fs');

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
    readStarsFromFile(infileName) {
        fs.readFile(infileName, 'binary', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(data);
        })
    }

    deserialize(rawStarData) {
        let stars = [];
        
        let index = 0;
        while (index < rawStarData.byteLength) {
            const starKey = rawStarData.readIntBE(index, 4);
            index += 4

            // Read unknown values
            const unk1 = rawStarData.readIntBE(index, 4);
            const unk2 = rawStarData.readIntBE(index + 4, 4);
            const unk3 = rawStarData.readIntBE(index + 8, 4);
            const unk4 = rawStarData.readIntBE(index + 12, 4);
            index += 16;
            
            // Skip bytes
            index += 116;

            // Read star position (3 floats)
            const x = rawStarData.readFloatBE(index);
            const y = rawStarData.readFloatBE(index + 4);
            const z = rawStarData.readFloatBE(index + 8);
            index += 12;

            const position = new Vector3(x, y, z);

            // Read more unk values
            const unk5 = rawStarData.readIntBE(index, 4);
            index += 4;

            // Read star flags (4-bytes)
            const flags = rawStarData.readIntBE(index, 4);
            index += 4;

            // Read name length (4-byte int)
            const nameLen = rawStarData.readIntBE(index, 4);
            index += 4;

            // Read name (utf16le string)
            const nameBuffer = rawStarData.slice(index, index + nameLen * 2);
            const name = nameBuffer.toString('utf16le');
            index += nameLen * 2;

            // Read more unk vaules
            const unk6 = rawStarData.readIntBE(index, 4);
            const unk7 = rawStarData.readIntBE(index + 4, 4);
            const unk8 = rawStarData.readIntBE(index + 8, 4);
            const unk9 = rawStarData.readIntBE(index + 12, 4);
            const unk10 = rawStarData.readIntBE(index + 16, 4);
            index += 20;
            
            // Read star type (4-byte int)
            const type = rawStarData.readIntBE(index, 4);
            index += 4;
            
            // Skip rest of the bytes
            index += 52

            // Read planet count (1-byte int)
            const planetCount = rawStarData.readIntBE(index, 1);
            index += 1;

            let star = new StarRecord(starKey, unk1, unk2, unk3, unk4, position, unk5, flags, name, unk6, unk7, unk8, unk9, unk10, type, planetCount);
            stars.push(star);
        }
        return stars;
    }
}


module.exports = StarParser;