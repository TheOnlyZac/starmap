const fs = require('fs');

class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class StarRecord {
    constructor(name, position) {
        this.name = name;
        this.position = position;
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
        while (index < rawStarData.length) {
            // Skip bytes
            index += 136;

            // Read star position (3 floats)
            const x = rawStarData.readFloatBE(index);
            const y = rawStarData.readFloatBE(index + 4);
            const z = rawStarData.readFloatBE(index + 8);
            index += 12;

            const position = new Vector3(x, y, z);

            index += 8;

            // Read name length (4-byte int)
            const nameLen = rawStarData.readIntBE(index, 4);
            index += 4;

            // Read name (utf16le string)
            const nameBuffer = rawStarData.slice(index, index + nameLen * 2);
            const name = nameBuffer.toString('utf16le');
            index += nameLen * 2;

            // Skip rest of the data
            index += 77

            let star = new StarRecord(name, position);
            stars.push(star);
        }
        return stars;
    }
}


module.exports = StarParser;