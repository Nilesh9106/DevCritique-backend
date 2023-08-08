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

upload.post("/file/upload",multer({ storage: multer.diskStorage({}) }).single("file"),
    async (req, res) => {
        try {
            let fileUploaded = await handleUpload(req.file.path, {quality : "auto"});

            res.status(200).json({ success: true, fileURL: fileUploaded.url });

        } catch (err) {
            res.status(500).json({ success: false, error: err });
        }
    });


async function deleteFile(imageurl) {
    try {
        let public_id = imageurl.split("/").pop().split(".")[0];
        let deleted = await cloudinary.uploader.destroy(public_id);
    } catch (err) {
        console.log(err);
    }
}
module.exports = {upload, deleteFile};