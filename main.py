import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URI)
db = client.song
collection = db.playlists

SEED_PLAYLISTS = [
    {
        "title": "Retro Classics",
        "description": "Classic Hindi melodies from the golden era.",
        "cover": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=60",
        "songs": [
            {
                "title": "Likhe Jo Khat Tujhe",
                "artist": "Mohammed Rafi",
                "url": "assets/songs/Likhe Jo Khat Tujhe.mp3",
                "duration": "4:30"
            },
            {
                "title": "Main Shair To Nahin",
                "artist": "Shailendra Singh",
                "url": "assets/songs/Main Shair To Nahin.mp3",
                "duration": "5:15"
            },
            {
                "title": "Yeh Raaten Yeh Mausam",
                "artist": "Kishore Kumar & Asha Bhosle",
                "url": "assets/songs/Yeh Raaten Yeh Mausam.mp3",
                "duration": "3:15"
            }
        ]
    },
    {
        "title": "Kishore Kumar Special",
        "description": "Unforgettable tracks sung by Kishoreda.",
        "cover": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=60",
        "songs": [
            {
                "title": "Yeh Raaten Yeh Mausam",
                "artist": "Kishore Kumar & Asha Bhosle",
                "url": "assets/songs/Yeh Raaten Yeh Mausam.mp3",
                "duration": "3:15"
            }
        ]
    },
    {
        "title": "Bollywood Love Songs",
        "description": "Romantic duets and retro love hits.",
        "cover": "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&auto=format&fit=crop&q=60",
        "songs": [
            {
                "title": "Main Shair To Nahin",
                "artist": "Shailendra Singh",
                "url": "assets/songs/Main Shair To Nahin.mp3",
                "duration": "5:15"
            },
            {
                "title": "Yeh Raaten Yeh Mausam",
                "artist": "Kishore Kumar & Asha Bhosle",
                "url": "assets/songs/Yeh Raaten Yeh Mausam.mp3",
                "duration": "3:15"
            }
        ]
    }
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Check if database is empty and seed it
    try:
        count = await collection.count_documents({})
        if count == 0:
            print("Database is empty. Seeding playlist data...")
            await collection.insert_many(SEED_PLAYLISTS)
            print("Data seeded successfully.")
        else:
            print(f"Found {count} playlists in database. Skipping seeding.")
    except Exception as e:
        print(f"Error checking/seeding database during startup: {e}")
    yield
    # Shutdown logic
    client.close()

app = FastAPI(lifespan=lifespan)

def serialize_playlist(doc):
    return {
        "id": str(doc["_id"]),
        "title": doc.get("title", ""),
        "description": doc.get("description", ""),
        "cover": doc.get("cover", ""),
        "songs": [
            {
                "title": s.get("title", ""),
                "artist": s.get("artist", ""),
                "url": s.get("url", ""),
                "duration": s.get("duration", "")
            }
            for s in doc.get("songs", [])
        ]
    }

@app.get("/api/playlists")
async def get_playlists():
    try:
        playlists_cursor = collection.find()
        playlists = []
        async for doc in playlists_cursor:
            playlists.append(serialize_playlist(doc))
        return playlists
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Mount static files after defining API endpoints
app.mount("/", StaticFiles(directory="spotify.makeup", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=3000, reload=True)