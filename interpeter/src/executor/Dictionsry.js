function createSpecialDictionary() {
    const dict = {};

    function add(key, value) {
        if (dict.hasOwnProperty(key)) {
            console.log("Key already exists in the dictionary.");
            return false; // Indicate failure to add because key exists
        }
        dict[key] = value;
        console.log(`Added: ${key} -> ${value}`);
        return true; // Indicate success
    }

    function remove(key) {
        if (!dict.hasOwnProperty(key)) {
            console.log("Key not found in the dictionary.");
            return false; // Indicate failure to remove because key does not exist
        }
        delete dict[key];
        console.log(`Removed: ${key}`);
        return true; // Indicate success
    }

    function getValue(key) {
        if (dict.hasOwnProperty(key)) {
            console.log(`Found: ${key} -> ${dict[key]}`);
            return dict[key]; // Return the value associated with the key
        }
        console.log("Key not in dictionary.");
        return null; // Return null if the key does not exist
    }

    function check(key) {
        const exists = dict.hasOwnProperty(key);
        console.log(`${key} exists: ${exists}`);
        return exists; // Return true if the key exists, false otherwise
    }

    function listEntries() {
        console.log("Current dictionary entries:");
        let entries = [];
        for (const key in dict) {
            console.log(`${key}: ${dict[key]}`);
            entries.push(`${key}: ${dict[key]}`);
        }
        return entries;
    }

    function addtodictinory(sentence) {
        const regex = /(\w+) in room (\d+)/; // Regex pattern to match "someone in room <number>"
        const match = sentence.match(regex);

        if (!match) {
            console.log("Invalid input format. Please provide a sentence in the format: 'someone in room <number>'.");
            return false; // Indicate failure due to invalid input format
        }

        const [, name, roomNumber] = match; 
        const key = `detection in room ${roomNumber}`;
        const value = `${name} in room ${roomNumber}`;

        if (dict.hasOwnProperty(key)) {
            console.log("Key already exists in the dictionary.");
            return false; // Indicate failure to add because key exists
        }

        dict[key] = value;
        console.log(`Added: ${key} -> ${value}`);
        return true; // Indicate success
    }

    // other functions...

    return { add , remove, getValue, check, listEntries };
}

   


const myDict = createSpecialDictionary();
myDict.add("Joe in room 17886285-1875", "detection at  room  is equal to true")
myDict.add("Joe not in room 17886285-1875 ", "detection at room  is equal to false")
// myDict.add("spring ", "season is spring")
// myDict.add("summer ", "season is summer")
// myDict.add("fall ", "season is fall")
// myDict.add("winter ", "season is winter")
// myDict.add("studying","activity  is studying")
// myDict.add("cooking ","activity is cooking")
// myDict.add("eating ","activity is eating")
// myDict.add("playing ","activity is playing")
// myDict.add("watching_tv ","activity is watching tv")
// myDict.add("sleeping ","activity is sleeping")



module.exports = myDict;
