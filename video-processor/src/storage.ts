import { Storage } from "@google-cloud/storage";
import fs from 'fs';
import Ffmpeg from "fluent-ffmpeg";

const storage = new Storage();

const rawVidBucketName = "NickCdub-Raw-Videos"
const procVidBucketName = "NickCdub-Processed-Videos"

const localRawVidPath = "./raw-videos"
const localProcessedVidPath = "./processed-videos"

/**
 * Creates the local directories for raw and processed videos
 */

export function setupDir(): void {
    try{
        if(!fs.existsSync(localRawVidPath)) {
            fs.mkdirSync(localRawVidPath, { recursive: true });
        }
        if(!fs.existsSync(localProcessedVidPath)) {
            fs.mkdirSync(localProcessedVidPath, { recursive: true });
        }
    } catch (error: any){
        console.error(`An error occurred: ${error.message}`);
    }
}

/**
 * @param rawVid - The name of the file to convert from {@link localRawVid}
 * @param procVid - The name of the file to convert to {@link localProcVid}
 * @returns A promise that resolved when the video has been converted.
 */
export function convertVid(rawVideoName: string, processedVideoName: string) {
    return new Promise <void>((resolve, reject) => {
        // Start the video processing
        Ffmpeg(`${localRawVidPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=-1:720") //720p
        .on("end", () => {
            console.log("Video processing completed");
            console.log("Video processing successfully completed");
            resolve();
        })
        .on("error", (err) => {
            console.error("Error processing video:", err.message);
            console.log("Error processing video");
            reject(err)
        })
        .save(`${localProcessedVidPath}/${processedVideoName}`);
    })
}

/**
 * @param fileName - The name of the file to download from the
 * {@link rawVidBucketName} bucket into the {@link localRawVidPath} folder.
 * @return A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(filename: string) {
    await storage.bucket(rawVidBucketName)
    .file(filename)
    .download({ destination: `${localRawVidPath}/${filename}`});

    console.log(`Successfully downloaded ${filename}`);
}


/**
 * @param fileName - The name of the file to upload from the
 * {@link localProcessedVidPath} folder into the {@link procVidBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadProcVideo(filename: string) {
    const bucket = storage.bucket(procVidBucketName);

    await bucket.upload(`${localProcessedVidPath}/${filename}`, {
        destination: filename,
    });

    console.log(`Successfully uploaded ${filename}`);

    await bucket.file(filename).makePublic();
}

//Deletes the raw video from the local directory
export function deleteRawVideo(filename: string) {
    return deletefile(`${localRawVidPath}/${filename}`);
}

//Deletes the processed video from the local directory
export function deleteProcVideo(filename: string) {
    return deletefile(`${localProcessedVidPath}/${filename}`);
}


/**
 * @param fileName - The name of the file to delete from the
 * {@link rawVidBucketName} bucket.
 * @returns A promise that resolves when the file has been deleted.
 */
function deletefile(fileName: string): Promise <void> {
    return new Promise <void>((resolve, reject) => {
        if(!fs.existsSync(`${localRawVidPath}/${fileName}`)) {
            reject(console.log(`${fileName} does not exist`));
        }else{
            fs.unlink(`${localRawVidPath}/${fileName}`, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        }
    })
}