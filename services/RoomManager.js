const RoomManager = {
    roomDict: {
        "bathroom": {
            room_id: "38197016",
            Space_id: "61097711",
            namespace: "SmartHome",
            devices: ["light", "fan", "ac"],
            temperature: 25,
            humidity: 75,
            detection: false,
            activity: "studying",
            season: "spring"
        },
        "livingroom": {
            room_id: "38197016",
            Space_id: "61097711",
            namespace: "SmartHome",
            devices: ["AC", "TV", "light", "Bulb"],
            temperature: 10,
            humidity: 70,
            detection: true,
            activity: "sleeping",
            season: "summer"
        },
        "class247": {
            Room_id: "17886285-1875",
            Space_id: "17886285",
            namespace: "SmartSchool",
            devices: ["projector", "fan", "bulb", "Ac"],
            temperature: -3,
            humidity: 80,
            detection: false,
            activity: "eating",
            season: "autumn"
        },
        "room 247" : {
            Room_id: "17886285-1875",
            Space_id: "17886285",
            namespace: "SmartSchool",
            devices: ["projector", "fan", "bulb", "Ac"],
            temperature: -3,
            humidity: 80,
            detection: false,
            activity: "eating",
            season: "autumn"
        }
    },

    getRoom(key) {
        return this.roomDict[key];
    },

    addRoom(key, room) {
        this.roomDict[key] = room;
    },

    getAllRooms() {
        return this.roomDict;
    },

    removeRoom(key) {
        delete this.roomDict[key];
    },

    hasRoom(key) {
        return key in this.roomDict;
    },

    printRoom(key) {
        const room = this.getRoom(key);
        if (room) {
            console.log(`Room: ${key}`);
            console.log(`  Room ID: ${room.room_id || room.Room_id}`);
            console.log(`  Space ID: ${room.Space_id}`);
            console.log(`  Namespace: ${room.namespace}`);
            console.log(`  Devices: ${room.devices.join(', ')}`);
            console.log(`  Temperature: ${room.temperature}`);
            console.log(`  Humidity: ${room.humidity}`);
            console.log(`  Detection: ${room.detection}`);
            console.log(`  Activity: ${room.activity}`);
            console.log(`  Season: ${room.season}`);
        } else {
            console.log(`Room "${key}" not found`);
        }
    },


    printRoomField(key, field) {
        const room = this.getRoom(key);
        if (room) {
            if (field in room) {
                console.log(`The ${field} of the room "${key}" is: ${room[field]}`);
            } else {
                console.log(`Field "${field}" not found in room "${key}"`);
            }
        } else {
            console.log(`Room "${key}" not found`);
        }
    }
};

// Export the RoomManager object
module.exports = RoomManager;
