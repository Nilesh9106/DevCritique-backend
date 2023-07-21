require("dotenv").config();

const express = require("express");
const multer = require("multer");
const upload = express();

const {
    BlobServiceClient,
    StorageSharedKeyCredential,
    newPipeline,
} = require("@azure/storage-blob");

const { Readable } = require("stream");
const path = require("path");

//Azure
const uploadOptions = { bufferSize: 4 * 1024 * 1024, maxBuffers: 20 };
const sharedKeyCredential = new StorageSharedKeyCredential(
    process.env.AZURE_ACCOUNT_NAME,
    process.env.AZURE_ACCESS_KEY
);

const pipeline = newPipeline(sharedKeyCredential);
const blobServiceClient = new BlobServiceClient(
    process.env.AZURE_ENDPOINT_URL,
    pipeline
);

const containerClient = blobServiceClient.getContainerClient(
    process.env.AZURE_CONTAINER_NAME
);

upload.post("/file/upload",
    multer({ storage: multer.memoryStorage() }).single("file"),
    async (req, res) => {
        try {
            let { originalname, buffer, mimetype } = req.file;
            let { parent_id } = req.query;
            let random = Math.floor(Math.random() * 1000);
            let fileName = parent_id + "_" + random + originalname;
            let blobName = `${fileName}`;
            let stream = Readable.from(buffer);

            let blockBlobClient = containerClient.getBlockBlobClient(blobName);
            const azureResponse = await blockBlobClient.uploadStream(
                stream,
                uploadOptions.bufferSize,
                uploadOptions.maxBuffers,
                { blobHTTPHeaders: { blobContentType: mimetype } }
            );

            let fileUrl = azureResponse._response.request.url;
            let fileURL = fileUrl.split("?")[0];


            res.status(200).json({ success: true, fileURL, fileName });

        } catch (err) {
            res.status(500).json({ success: false, error: err });
        }
    });

// delete file from azure
upload.delete("/file/delete", async (req, res) => {
    try {
        const { file_name } = req.query;

        let blockBlobClient = containerClient.getBlockBlobClient(file_name);
        const azureResponse = await blockBlobClient.deleteIfExists({
            deleteSnapshots: "include",
        });

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err });
    }
});

upload.use(async (req, res, next) => {
    res.status(404).send("Sorry can't find that!");
}
);

upload.use(async (err, req, res, next) => {
    console.error(err);
    res.status(500).send("Something broke!");
});

module.exports = upload;