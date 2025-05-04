const fs = require("fs");
const fs1 = require("f" + "s");
const fs2 = require(`${"f"}s`);
const fs3 = require(["f", "s"].join(""));
const modules = { fs: require("fs") };
const fs4 = modules["fs"];
const fs5 = process.env.NODE_ENV === 'production' ? require('fs') : require('node:fs');

function getFS() {
  function reallyGetIt() {
    return require("fs");
  }
  return reallyGetIt();
}
const fs6 = getFS();

const allTheSame = [fs, fs1, fs2, fs3, fs4, fs5, fs6].every((fsModule) => fsModule === require('fs'));
console.log(allTheSame);