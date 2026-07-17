// ==========================================
// 1. SELECTING HTML ELEMENTS
// ==========================================
const playBtn = document.getElementById("play-btn");
const playIconImg = document.getElementById("play-icon-img");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

const seekbar = document.getElementById("main-seekbar");
const seekProgress = document.getElementById("seek-progress");
const seekCircle = document.getElementById("seek-circle");
const currentTimeLabel = document.getElementById("current-time");
const totalTimeLabel = document.getElementById("total-time");

const volumeBtn = document.getElementById("volume-btn");
const volumeSlider = document.getElementById("volume-slider");
const volumeIconImg = document.getElementById("volume-icon-img");

const cardsContainer = document.querySelector(".cardscontainer");
const songListContainer = document.getElementById("song-list-element");
const nowPlayingTitle = document.querySelector(".songname");

// ==========================================
// 2. PLAYLISTS & SONG DATABASE
// ==========================================
let playlists = [];

// ==========================================
// 3. AUDIO STATE CONFIGURATION
// ==========================================
const audio = new Audio();
let currentPlaylistIndex = 0;
let currentSongIndex = 0;
let isPlaying = false;
let isMuted = false;
let lastVolume = 70; // Saved volume for when we unmute

// ==========================================
// 4. MAIN MUSIC FUNCTIONS
// ==========================================

// Create and show all playlist cards on page
function renderPlaylists() {
    if (!cardsContainer) return;
    cardsContainer.innerHTML = "";

    playlists.forEach((playlist, index) => {
        const card = document.createElement("div");
        card.className = "cards";

        card.innerHTML = `
            <img src="${playlist.cover}" alt="${playlist.title}">
            <h3>${playlist.title}</h3>
            <p>${playlist.description}</p>
        `;

        // Switch playlist when user clicks a card
        card.addEventListener("click", () => {
            selectPlaylist(index);
        });

        cardsContainer.appendChild(card);
    });
}

// Select a playlist and load its first song
function selectPlaylist(index) {
    currentPlaylistIndex = index;

    // Highlight selected card visually
    const allCards = document.querySelectorAll(".playlists .cards");
    allCards.forEach((card, idx) => {
        if (idx === index) {
            card.classList.add("active-playlist");
        } else {
            card.classList.remove("active-playlist");
        }
    });

    renderSongs();
    loadSong(0, isPlaying); // Load the first song (autoplay only if already playing)
}

// Show the list of songs of the selected playlist in Library
function renderSongs() {
    if (!songListContainer) return;
    songListContainer.innerHTML = "";

    const activePlaylist = playlists[currentPlaylistIndex];
    activePlaylist.songs.forEach((song, index) => {
        const li = document.createElement("li");
        li.className = "song-item";

        li.innerHTML = `
            <div class="song-item-left">
                <img class="song-play-icon" src="assets/play-button.svg" alt="play">
                <div class="song-item-info">
                    <span class="song-item-title">${song.title}</span>
                    <span class="song-item-artist">${song.artist}</span>
                </div>
            </div>
            <div class="song-item-right">
                <span class="song-item-duration">${song.duration}</span>
            </div>
        `;

        // Click song row to play
        li.addEventListener("click", (e) => {
            e.stopPropagation();
            if (currentSongIndex === index) {
                togglePlay();
            } else {
                loadSong(index, true); // Play selected song immediately
            }
        });

        songListContainer.appendChild(li);
    });
}

// Load song details, source URL and reset player UI
function loadSong(songIndex, autoPlay = false) {
    currentSongIndex = songIndex;
    const song = playlists[currentPlaylistIndex].songs[songIndex];

    audio.src = song.url;
    nowPlayingTitle.innerText = `${song.title} - ${song.artist}`;

    // Reset progress seekbar visuals
    seekProgress.style.width = "0%";
    seekCircle.style.left = "calc(0% - 6px)";
    currentTimeLabel.innerText = "0:00";
    totalTimeLabel.innerText = song.duration;

    updateActiveSongUI();

    if (autoPlay) {
        playAudio();
    } else {
        pauseAudio();
    }
}

// Highlight current active song in list and change play/pause sub-icons
function updateActiveSongUI() {
    const songItems = songListContainer.querySelectorAll("li");
    songItems.forEach((li, idx) => {
        const icon = li.querySelector(".song-play-icon");
        if (idx === currentSongIndex) {
            li.classList.add("active-song");
            icon.src = isPlaying ? "assets/pause-button.svg" : "assets/play-button.svg";
        } else {
            li.classList.remove("active-song");
            icon.src = "assets/play-button.svg";
        }
    });
}

// Play current track
function playAudio() {
    audio.play().then(() => {
        isPlaying = true;
        playIconImg.src = "assets/pause-button.svg";
        updateActiveSongUI();
    }).catch(err => console.error("Playback failed:", err));
}

// Pause current track
function pauseAudio() {
    audio.pause();
    isPlaying = false;
    playIconImg.src = "assets/play-button.svg";
    updateActiveSongUI();
}

// Play or pause toggle
function togglePlay() {
    if (isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

// Go to next song in playlist
function nextSong() {
    const songs = playlists[currentPlaylistIndex].songs;
    let nextIdx = (currentSongIndex + 1) % songs.length;
    loadSong(nextIdx, true);
}

// Go to previous song in playlist
function prevSong() {
    const songs = playlists[currentPlaylistIndex].songs;
    let prevIdx = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(prevIdx, true);
}

// Update volume settings
function setVolume(volumeValue) {
    audio.volume = volumeValue / 100;

    if (volumeValue === 0) {
        volumeIconImg.src = "assets/mute.svg";
        isMuted = true;
    } else {
        volumeIconImg.src = "assets/volume.svg";
        isMuted = false;
        lastVolume = volumeValue; // Save non-zero volume
    }
}

// Convert seconds into m:ss format
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// ==========================================
// 5. REGISTER EVENT LISTENERS
// ==========================================

// Play bar buttons
playBtn.addEventListener("click", togglePlay);
prevBtn.addEventListener("click", prevSong);
nextBtn.addEventListener("click", nextSong);

// Seekbar Click to change song position
seekbar.addEventListener("click", (e) => {
    if (!audio.duration) return;
    const clickedPercentage = e.offsetX / seekbar.clientWidth;
    audio.currentTime = clickedPercentage * audio.duration;
});

// Update seekbar as music plays
audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const currentPercent = (audio.currentTime / audio.duration) * 100;

    seekProgress.style.width = currentPercent + "%";
    seekCircle.style.left = `calc(${currentPercent}% - 6px)`;
    currentTimeLabel.innerText = formatTime(audio.currentTime);
    totalTimeLabel.innerText = formatTime(audio.duration);
});

// Automatically play next song when current one finishes
audio.addEventListener("ended", nextSong);

// Volume slider bar drag/input changes
volumeSlider.addEventListener("input", (e) => {
    setVolume(parseInt(e.target.value));
});

// Volume icon click to mute/unmute
volumeBtn.addEventListener("click", () => {
    if (isMuted) {
        setVolume(lastVolume);
        volumeSlider.value = lastVolume;
    } else {
        setVolume(0);
        volumeSlider.value = 0;
    }
});

// ==========================================
// 6. INITIALIZATION ON RUN
// ==========================================
window.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/api/playlists");
        playlists = await response.json();
        renderPlaylists();
        if (playlists.length > 0) {
            selectPlaylist(0); // Select first playlist on load
        }
    } catch (error) {
        console.error("Error loading playlists from server:", error);
    }
    setVolume(70); // Set default volume to 70%
    volumeSlider.value = 70;
});