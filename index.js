const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { exec } = require("youtube-dl-exec");
const { google } = require("googleapis");
const axios = require("axios");
// const fbVideoDownloader = require("fb-video-downloader");

// Your code using fb-video-downloader module
// ...

const app = express();
const API_KEY = "AIzaSyDRS9th-uq9kqdctFEeYhHqDzag8UugBMQ";

// bodyParser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", "./views");
// get home page for
app.get("/youtube", (req, res) => {
  const video = 0;

  res.render("home", { video: video });
});
app.get("/facebook", (req, res) => {
  const video = 0;

  res.render("facebook", { video: video });
});

function extractVideoId(url) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  return match ? match[1] : null;
}

app.get("/youtube/video", async (req, res) => {
  try {
    const link = req.query.link; // Extract the 'link' query parameter
    const videoId = extractVideoId(link); // Function to extract video ID from the URL

    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const fetchVid = google.youtube({
      version: "v3",
      auth: API_KEY,
    });

    const response = await fetchVid.videos.list({
      part: "snippet",
      id: videoId,
    });

    const video = response.data.items;
    res.render("home", { video: video });
  } catch (err) {
    console.error("Error fetching videos:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// submit form to download YouTube video
app.post("/youtube/video/download", async (req, res) => {
  const video = 0;
  const videoLink = req.body.link;

  try {
    const videoQuality = req.body.quality;

    const options = ["-f", "bestvideo[height<=" + videoQuality + "]+bestaudio"];

    const videoName = "downloaded_video.mp4"; // Specify the name for the downloaded video file

    const videoStream = await exec([videoLink, ...options], {
      output: videoName,
    });
    const stats = await fs.promises.stat(__dirname + "/" + videoName);
    const fileSizeInBytes = stats.size;
    console.log(`File Size: ${fileSizeInBytes} bytes`);

    console.log("Video downloaded successfully:", videoName);
    console.log("Video downloaded successfully:", options);

    // Sending the downloaded video file as a response (you might want to send a different response or redirect the user)
    res.download(__dirname + "/" + videoName, videoName, async (err) => {
      if (err) {
        console.error("Error sending file for download:", err);
        res.status(500).send("Error sending file for download");
      } else {
        // Optionally, you can delete the file after sending it for download

        fs.unlinkSync(__dirname + "/" + videoName);
      }
    });
  } catch (err) {
    console.error("Error downloading video:", err);
    res.status(500).send("Error downloading video");
  }
});

// listen to the port
const port = 3000;
app.listen(port, () => {
  console.log("Server listening on port", port);
});
