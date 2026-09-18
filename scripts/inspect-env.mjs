import fs from "fs";
const t = fs.readFileSync(".env.local", "utf8");
t.split(/\r?\n/).forEach((line, i) => {
  const m = line.match(/^([A-Z_]+)\s*=\s*(.*)$/);
  if (m) {
    const v = m[2];
    console.log(`${i + 1}: ${m[1]}=${v.slice(0, 4)}…[redacted, length ${v.length}]`);
  } else {
    console.log(`${i + 1}: ${JSON.stringify(line.slice(0, 70))}`);
  }
});
console.log("---");
console.log("contains 'AIza':", /AIza/.test(t));
console.log("contains 'sk-ant':", /sk-ant/.test(t));
console.log("contains 'PASTE':", /PASTE/.test(t));
