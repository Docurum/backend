import crypto from "crypto";

const totalKeys = 10;
const keys: string[] = [];

for (let i = 0; i < totalKeys; i++) {
  const key = crypto
    .randomBytes(40)
    .toString("hex")
    .split("")
    .map((ch) => (Math.round(Math.random()) ? ch.toUpperCase() : ch.toLowerCase()))
    .join("");
  keys.push(key);
}

console.table(keys);
