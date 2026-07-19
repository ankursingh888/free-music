import os
from typing import Any
from urllib.parse import urlencode

import requests
from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles

JAMENDO_BASE_URL = "https://api.jamendo.com/v3.0/tracks/"
JAMENDO_CLIENT_ID = os.getenv("JAMENDO_CLIENT_ID")
JAMENDO_LIMIT = int(os.getenv("JAMENDO_LIMIT", "10"))
JAMENDO_SEARCH = os.getenv("JAMENDO_SEARCH", "").strip()
JAMENDO_LANGUAGE = os.getenv("JAMENDO_LANGUAGE", "en")

app = FastAPI()

def format_duration(seconds: Any) -> str:
    try: 
        total = int(float(seconds))
    except (TypeError, ValueError):
        return "0:00"

    minutes = total // 60
    remaining_seconds = total % 60
    return f"{minutes}:{remaining_seconds:02d}"


def build_jamendo_url(search_query: str | None = None) -> str:
    if not JAMENDO_CLIENT_ID:
        raise ValueError(
            "JAMENDO_CLIENT_ID is not set. Add it to your environment before starting the app."
        )

    search_value = (search_query or JAMENDO_SEARCH or "").strip()

    params = {
        "client_id": JAMENDO_CLIENT_ID,
        "format": "json",
        "limit": JAMENDO_LIMIT,
        "lang": JAMENDO_LANGUAGE,
    }

    if search_value:
        params["search"] = search_value

    return f"{JAMENDO_BASE_URL}?{urlencode(params)}"


def sanitize_track(track: dict[str, Any]) -> dict[str, Any] | None:
    audio_url = track.get("audiodownload") or track.get("audio") or track.get("stream")
    if not audio_url:
        return None

    return {
        "title": track.get("name") or track.get("title") or "Untitled Track",
        "artist": track.get("artist_name") or track.get("artist") or "Unknown Artist",
        "url": audio_url,
        "duration": format_duration(track.get("duration")),
    }


def fetch_jamendo_playlists(search_query: str | None = None) -> list[dict[str, Any]]:
    url = build_jamendo_url(search_query)
    response = requests.get(url, timeout=20)
    response.raise_for_status()

    payload = response.json()
    results = payload.get("results", [])

    songs = []
    for track in results:
        song = sanitize_track(track)
        if song:
            songs.append(song)

    if not songs:
        raise HTTPException(status_code=404, detail="No tracks returned from Jamendo.")

    first_track = results[0]
    return [
        {
            "title": "Jamendo Discover",
            "description": "Music fetched live from the Jamendo API.",
            "cover": first_track.get("image")
            or first_track.get("album_image")
            or "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&auto=format&fit=crop&q=60",
            "songs": songs,
        }
    ]


@app.get("/api/playlists")
async def get_playlists(
    search: str | None = Query(default=None, description="Search term to pass to Jamendo")
):
    try:
        return fetch_jamendo_playlists(search_query=search)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Jamendo error: {str(exc)}") from exc


# Keep the SPA available at the root path
app.mount("/", StaticFiles(directory="spotify.makeup", html=True), name="static")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main_1:app", host="127.0.0.1", port=3000, reload=True)
    