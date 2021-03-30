import fs from "fs";

export function storeData(data, path) {
    try {
        fs.writeFileSync(path, JSON.stringify(data));
    } catch (err) {
        console.error(err);
    }
}
export function loadData(path) {
    try {
        return JSON.parse(fs.readFileSync(path, 'utf8'))
    } catch (err) {
        console.error(err)
        return false
    }
}
export function getStat(path) {
    try {
        return fs.existsSync(path) === true;
    } catch(err) {
        console.error(err)
        return false;
    }
}