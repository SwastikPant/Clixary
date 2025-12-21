from celery import shared_task
from PIL import Image as PILImage
from io import BytesIO
from django.core.files.base import ContentFile
import os

@shared_task
def generate_thumbnail(image_id):
    from images.models import Image
    
    try:
        image_obj = Image.objects.get(id=image_id)
        
        # Open original image
        img = PILImage.open(image_obj.original_image.path)
        
        # Create thumbnail (max 400x400)
        img.thumbnail((400, 400), PILImage.Resampling.LANCZOS)
        
        # Convert RGBA/LA/P to RGB (for JPEG compatibility)
        if img.mode in ('RGBA', 'LA', 'P'):
            # Create white background
            rgb_img = PILImage.new('RGB', img.size, (255, 255, 255))
            rgb_img.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)
            img = rgb_img
        
        # Save to BytesIO
        thumb_io = BytesIO()
        img.save(thumb_io, format='JPEG', quality=85)
        thumb_io.seek(0)
        
        # Generate filename
        original_name = os.path.basename(image_obj.original_image.name)
        name_without_ext = os.path.splitext(original_name)[0]
        thumb_name = f'thumb_{name_without_ext}.jpg'
        
        # Save to model
        image_obj.thumbnail.save(
            thumb_name,
            ContentFile(thumb_io.read()),
            save=True
        )
        
        return f"Thumbnail created: {thumb_name}"
    
    except Exception as e:
        return f"Error: {str(e)}"


@shared_task
def apply_watermark(image_id, watermark_text="Event Photo Platform"):
    """Apply watermark to an image"""
    from images.models import Image
    from PIL import ImageDraw, ImageFont
    
    try:
        image_obj = Image.objects.get(id=image_id)
        
        # Open original image
        img = PILImage.open(image_obj.original_image.path)
        
        # Convert to RGBA if needed
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Create transparent overlay
        overlay = PILImage.new('RGBA', img.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Calculate position (bottom-right corner)
        width, height = img.size
        
        # Try to use a font, fallback to default
        try:
            font = ImageFont.truetype("arial.ttf", 40)
        except:
            font = ImageFont.load_default()
        
        # Get text size
        bbox = draw.textbbox((0, 0), watermark_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Position: 20px from bottom-right
        x = width - text_width - 20
        y = height - text_height - 20
        
        # Draw semi-transparent watermark
        draw.text((x, y), watermark_text, fill=(255, 255, 255, 128), font=font)
        
        # Composite the watermark onto original
        watermarked = PILImage.alpha_composite(img, overlay)
        
        # Convert back to RGB
        watermarked = watermarked.convert('RGB')
        
        # Save to BytesIO
        watermark_io = BytesIO()
        watermarked.save(watermark_io, format='JPEG', quality=95)
        watermark_io.seek(0)
        
        # Generate filename
        original_name = os.path.basename(image_obj.original_image.name)
        watermark_name = f'watermarked_{original_name}'
        
        # Save to model
        image_obj.watermarked_image.save(
            watermark_name,
            ContentFile(watermark_io.read()),
            save=True
        )
        
        return f"Watermark created: {watermark_name}"
    
    except Exception as e:
        return f"Error: {str(e)}"