require("dotenv").config();

const express = require("express");
const multer = require("multer");
var cloudinary = require('cloudinary').v2;
const path = require("path");

const upload = express();
//confing cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});
async function handleUpload(file) {
    const res = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
    });
    return res;
}



upload.post("/file/upload",
    multer({ storage: multer.diskStorage({}) }).single("file"),
    async (req, res) => {
        try {
            let fileUploaded = await handleUpload(req.file.path)

            res.status(200).json({ success: true, fileURL: fileUploaded.url });

        } catch (err) {
            res.status(500).json({ success: false, error: err });
        }
    });


upload.use(async (req, res, next) => {
    res.status(404).send("Sorry can't find that!");
}
);

upload.use(async (err, req, res, next) => {
    res.status(500).send("Something broke!");
});

module.exports = upload;