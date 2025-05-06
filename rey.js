#!/bin/env node

const fs = require("fs");
const _$ = require("child_process");
const cwd = process.cwd();
let args = process.argv.slice(2);
const error = t => console.log("\x1b[41m" + t + "\x1b[0m");

async function main() {
    if (args[0] == "search") {
        const text = args[1];
        let dir = args[2];
        if (!dir) return error("please input the directory");
        if (!text) return error("the text must be filled");
        args = deleteAV([dir, args[0], text], args);
        skip = 2;

        dir = dir.replace(/^\./, cwd);
        const stat = fs.statSync(dir);
        if (stat.isDirectory()) {
            const d = await sft(dir, text),
                fileFinds = [];
            if (d.found) {
                for (const f of d.data) {
                    let count = 0;
                    const values = fs.readFileSync(f.dir, "utf8");
                    for (const { value, line, index } of searchText(
                        text,
                        values
                    )) {
                        count += 1;
                        console.log(`\x1b[36m${f.dir.replace(
                            cwd + "/",
                            ""
                        )}\x1b[0m:\x1b[33;1m${line}\x1b[0m:\x1b[33;1m${index}\x1b[0m
${value
    .trim()
    .replace(
        new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^ ]+)"),
        "\x1b[32m$&\x1b[0m"
    ).slice(0,35)}
`);
                    }
                    fileFinds.push(
                        `    ${count} ${f.dir.replace(cwd + "/", "")}`
                    );
                }
                console.log(`file include
${fileFinds.join("\n")}`);
            } else {
                error("can't find the text on this directory");
            }
        } else if (stat.isFile()) {
            const values = fs.readFileSync(dir, "utf8");
            console.log(searchText(text, values));
        }
    } else {
        console.log(args);
        error("unexpected command '" + args[0] + "'");
    }
}

function deleteAV(values, a) {
    const result = [];
    if (Array.isArray(values)) {
        for (const v of a) {
            if (!values.includes(v)) result.push(v);
        }
    } else if (typeof values == "string") {
        for (const v of a) {
            if (v != values) result.push(_v);
        }
    } else {
        throw new Error("the type of Values must only be string or array");
    }
    return result;
}
function searchText(tgt, txt) {
    txt = txt.split("\n");
    let line = 0;
    const result = [];
    for (const t of txt) {
        line += 1;
        if (t.includes(tgt)) {
            result.push({
                index: t.indexOf(tgt),
                value: t.slice(t.indexOf(tgt)),
                line
            });
            continue;
        }
    }
    return result;
}
async function sft(d, t) {
    const dirs = fs.readdirSync(d);
    let result = [];

    for (const _d of dirs) {
        const stat = fs.statSync(d + "/" + _d);

        if (stat.isDirectory()) {
            const status = await sft(d + "/" + _d, t);
            if (status.found) {
                result.push({
                    found: true,
                    data: status.data
                });
            }
        } else if (stat.isFile()) {
            const v = fs.readFileSync(d + "/" + _d, "utf8");
            if (v.includes(t)) {
                result.push({
                    found: true,
                    dir: d + "/" + _d,
                    filename: _d
                });
            }
        }
    }

    const flattenedResult = [];
    for (const i of result) {
        if (i?.data) {
            for (const data of i.data) {
                flattenedResult.push({
                    dir: data.dir,
                    filename: data.filename
                });
            }
        } else {
            flattenedResult.push({
                dir: i.dir,
                filename: i.filename
            });
        }
    }

    const finalResult = flattenedResult.filter(i => i.dir && i.filename);

    return {
        data: finalResult,
        found: finalResult.length > 0
    };
}
function insertByIndex(i, t, t2) {
    if (typeof i !== "number")
        throw new Error("type of index must only be number");
    if (typeof t !== "string")
        throw new Error("type of target must only be string");
    if (typeof t2 !== "string")
        throw new Error("type of newText must only be string");
    if (/\x1b\[(0|30|31|32|33|34|35|36|40|41|42|43|44|45|46)m/g.test(t2)) {
        console.log(true);
        return t.substr(0, i) + t2 + "\x1b[0m" + t.substr(i);
    }
    return t.substr(0, i) + t2 + t.substr(i + t2.length);
}

main();
