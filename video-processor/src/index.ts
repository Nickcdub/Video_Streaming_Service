const express = require("express");
import { Request, Response } from "express";
import { convertVid, deleteProcVideo, deleteRawVideo, downloadRawVideo, setupDir, uploadProcVideo } from "./storage";

setupDir();

const app = express();
app.use(express.json());

app.post("/video-processor", async (req: Request, res: Response) => {
    let data;
    try {
        const message = Buffer.from(req.body.data, "base64").toString("utf8");
        data = JSON.parse(message);

        if (!data.name) {
            throw new Error("No name provided");
        }
    } catch (error: any) {
        console.error(`An error occurred: ${error.message}`);
        return res.status(400).send(error.message);
    }

    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;

    //Download the raw video from Cloud Storage
    await downloadRawVideo(inputFileName);

    try{
        convertVid(inputFileName, outputFileName);
    }catch(err: any){
        await Promise.all([
            deleteRawVideo(inputFileName), 
            deleteProcVideo(outputFileName)
        ]);
        console.log(`Error processing video: ${err.message}`);
        return res.status(500).send("Error processing video");
    }

    //Upload processed vid to Cloud Storage
    await uploadProcVideo(outputFileName);

    await Promise.all([
        deleteRawVideo(inputFileName), 
        deleteProcVideo(outputFileName)
    ]);

    return res.status(200).send("Video processed successfully");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Video Processor listening at http://localhost:${port}`);
});