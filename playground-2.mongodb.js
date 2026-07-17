// MongoDB Playground
// Select the database to use.
use('song');

// Drop the collection if it already exists to start fresh.
db.getCollection('playlists').drop();

// Insert the playlist data directly into the 'playlists' collection.
db.getCollection('playlists').insertMany([
    {
        title: "Retro Classics",
        description: "Classic Hindi melodies from the golden era.",
        cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=60",
        songs: [
            {
                title: "Likhe Jo Khat Tujhe",
                artist: "Mohammed Rafi",
                url: "assets/songs/Likhe Jo Khat Tujhe.mp3",
                duration: "4:30"
            },
            {
                title: "Main Shair To Nahin",
                artist: "Shailendra Singh",
                url: "assets/songs/Main Shair To Nahin.mp3",
                duration: "5:15"
            },
            {
                title: "Yeh Raaten Yeh Mausam",
                artist: "Kishore Kumar & Asha Bhosle",
                url: "assets/songs/Yeh Raaten Yeh Mausam.mp3",
                duration: "3:15"
            }
        ]
    },
    {
        title: "Kishore Kumar Special",
        description: "Unforgettable tracks sung by Kishoreda.",
        cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=60",
        songs: [
            {
                title: "Yeh Raaten Yeh Mausam",
                artist: "Kishore Kumar & Asha Bhosle",
                url: "assets/songs/Yeh Raaten Yeh Mausam.mp3",
                duration: "3:15"
            }
        ]
    },
    {
        title: "Bollywood Love Songs",
        description: "Romantic duets and retro love hits.",
        cover: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&auto=format&fit=crop&q=60",
        songs: [
            {
                title: "Main Shair To Nahin",
                artist: "Shailendra Singh",
                url: "assets/songs/Main Shair To Nahin.mp3",
                duration: "5:15"
            },
            {
                title: "Yeh Raaten Yeh Mausam",
                artist: "Kishore Kumar & Asha Bhosle",
                url: "assets/songs/Yeh Raaten Yeh Mausam.mp3",
                duration: "3:15"
            }
        ]
    }
]);

// Query to verify that the documents were inserted.
db.getCollection('playlists').find({});
