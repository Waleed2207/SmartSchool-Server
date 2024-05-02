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

    return { add, remove, getValue, check, listEntries };
}

const myDict = createSpecialDictionary();
myDict.add("Joe in room 17886285-1875", "detection in room  is equal to true")
myDict.add("Joe in room 17886285-1875", "detection in room  is equal to false")
module.exports = myDict;
