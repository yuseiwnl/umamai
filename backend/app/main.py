import os
from io import BytesIO
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps
import pillow_heif
from supabase import create_client, Client

# --- Init ---

pillow_heif.register_heif_opener()  # Allow PIL.Image.open() to read HEIC/HEIF
app = FastAPI()

# (adjust as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://eat.umamai.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# --- Helpers ---

def to_webp_bytes(
    raw_bytes: bytes,
    *,
    max_width: int = 1600,
    quality: int = 85,
) -> bytes:
    """
    Open the uploaded image (any Pillow-supported format, including HEIC),
    normalize orientation, optionally downscale, and encode as WebP.
    """
    try:
        img = Image.open(BytesIO(raw_bytes))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")

    # Normalize orientation from EXIF so rotations look correct
    img = ImageOps.exif_transpose(img)

    # Convert mode (WebP supports RGB/RGBA). Keep alpha if present.
    if img.mode not in ("RGB", "RGBA"):
        # Use RGBA if the source has transparency; otherwise RGB
        img = img.convert("RGBA" if "A" in img.getbands() else "RGB")

    # Downscale if desired
    w, h = img.size
    if max(w, h) > max_width:
        scale = max_width / max(w, h)
        new_size = (int(w * scale), int(h * scale))
        # LANCZOS for good quality downscaling
        img = img.resize(new_size, Image.LANCZOS)

    # Encode to WebP in-memory
    out = BytesIO()
    # method=6 is slower but smaller; tweak for your latency/size balance
    img.save(out, format="WEBP", quality=quality, method=6, optimize=True)
    out.seek(0)
    return out.getvalue()

def upload_to_supabase(
    *, bucket: str, key: str, data: bytes, content_type: str, cache_control: int, upsert: bool
):
    """
    Uploads to Supabase Storage using the service role key.
    """
    # Note: supabase-py v2 storage API:
    res = supabase.storage.from_(bucket).upload(
        path=key,
        file=data,
        file_options={
            "content-type": content_type,
            "cacheControl": str(cache_control),
            "upsert": upsert,
        },
    )
    # supabase client returns a dict or raises; check for 'error' pattern:
    if isinstance(res, dict) and res.get("error"):
        raise HTTPException(status_code=500, detail=res["error"]["message"])

    return key

def create_signed_url(*, bucket: str, key: str, expires: int) -> Optional[str]:
    try:
        res = supabase.storage.from_(bucket).get_public_url(key)
        print(res)
        # supabase v2 returns dict with 'signedURL'
        return res
    except Exception:
        return None

# --- Route ---

@app.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    bucket: str = Form(...),
    object_key: str = Form(...),  # e.g. "{path}/{id}" or just "{id}"
    cache_control: int = Form(3600),
    upsert: bool = Form(False),
    # Optional tuning knobs:
    max_width: int = Form(1600),
    quality: int = Form(85),
    return_signed_url: bool = Form(True),
    signed_url_expires: int = Form(60 * 60 * 24 * 365),  # 365 days
):
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")

    # Convert to WebP
    webp_bytes = to_webp_bytes(raw, max_width=max_width, quality=quality)

    # Decide final storage key
    # If object_key already includes a path, append ".webp" once.
    final_key = f"{object_key}.webp" if not object_key.endswith(".webp") else object_key

    upload_to_supabase(
        bucket="media-private",
        key=object_key,
        data=raw,
        content_type="image/jpeg",
        cache_control=cache_control,
        upsert=upsert,
    )

    saved_key = upload_to_supabase(
        bucket=bucket,
        key=object_key,
        data=webp_bytes,
        content_type="image/webp",
        cache_control=cache_control,
        upsert=upsert,
    )

    # Optionally generate a signed URL here (or let the client do it)
    signed_url = (
        create_signed_url(bucket=bucket, key=saved_key, expires=signed_url_expires)
        if return_signed_url
        else None
    )

    return {
        "bucket": bucket,
        "storage_key": saved_key,
        "signed_url": signed_url,
        "content_type": "image/webp",
    }
