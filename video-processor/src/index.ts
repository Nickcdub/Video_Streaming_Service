import express from "express";
import ffmpeg from "fluent-ffmpeg";

const app = express();
app.use(express.json()); //Without this, our app won't know that requests will be coming in JSON and throw an error.

app.post("/video-processor", (req, res) => {
    // Get path of the input video
    const inputPath = req.body.inputPath;
    // Get path of the output video
    const outputPath = req.body.outputPath;

    //input and output are both required in our JSON request, so we will need to define them in every post request.

    //Error handling
    if (!inputPath || !outputPath) {
        res.status(400).send("Bad Request:Missing input or output path");
        return;
    }

    // Start the video processing
    ffmpeg(inputPath)
        .outputOptions("-vf", "scale=-1:720") //720p
        .on("end", () => {
            console.log("Video processing completed");
            res.status(200).send("Video processing successfully completed");
        })
        .on("error", (err) => {
            console.error("Error processing video:", err.message);
            res.status(500).send("Error processing video");
        })
        .save(outputPath);
        
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(
        `Video Processor listening at http://localhost:${port}`);
})