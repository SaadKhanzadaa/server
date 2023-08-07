const multer= require('multer');
const path= require('path');


//configuring multer
module.exports= multer({
storage:multer.diskStorage({}),
fileFilter:(req,file,cb) =>{
    let extension= path.extname(file.originalname);
    if(extension !== ".jpg" && extension !== ".png" && extension !== ".jpeg"){
        cb(new Error('File Type is not supported'),false)
        return;
    } 
    cb(null,true);
}
})