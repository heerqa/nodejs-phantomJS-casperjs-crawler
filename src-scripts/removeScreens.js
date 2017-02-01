export default function removeFolder(){
let fs = require('fs');
console.log("Remove file methods is called");
try {
console.log("Inside Try");
var files = fs.readdirSync("screens");
}
      catch(e) {
      console.log(e);
      return; }
      if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
            console.log("Inside for loop");
          var filePath = dirPath + '/' + files[i];
          if (fs.statSync(filePath).isFile()){
            fs.unlinkSync(filePath);
            console.log("INside IF");
            }
          else{
            rmDir(filePath);
           console.log("inside Else");

        }}
      fs.rmdirSync(dirPath);
   };