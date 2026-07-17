const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB database 'song'
mongoose.connect('mongodb://localhost:27017/song')
    .then(() => {
        console.log("Connected to MongoDB database 'song'.");
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });

// Define schemas & models (using the 'playlists' collection)
const songSchema = new mongoose.Schema({
    title: String,
    artist: String,
    url: String,
    duration: String
});

const playlistSchema = new mongoose.Schema({
    title: String,
    description: String,
    cover: String,
    songs: [songSchema]
});

const Playlist = mongoose.model('Playlist', playlistSchema);

// Serve all static assets inside the spotify.makeup folder
app.use(express.static(path.join(__dirname, 'spotify.makeup')));

// Endpoint to fetch playlists from database
app.get('/api/playlists', async (req, res) => {
    try {
        const playlistsData = await Playlist.find();
        res.json(playlistsData);
    } catch (error) {
        console.error("Error fetching playlists from database:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});