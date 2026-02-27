from PIL import Image
import pytesseract
import requests
from io import BytesIO

def download_image(url):
    response = requests.get(url)
    return Image.open(BytesIO(response.content))

def run_ocr(image):
    return pytesseract.image_to_string(image, lang='jpn+eng')