var fs = require("fs");

var fileContent = fs.readFileSync("sso.txt", "utf8");
var regexpsso = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/gm
var ssoarray = fileContent.match(regexpsso);
//console.log(ssoarray);
module.exports.spisok = ssoarray;


