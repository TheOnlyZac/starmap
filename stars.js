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
        return "PlaceholderResult";
    }
}


module.exports = StarParser;