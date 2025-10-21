from django.http import JsonResponse
from auto_app.models import VehiclePhoto, Vehicle
from auto_app.utils import base64_file
import json

def upload_vehicle_image(request):
    """Handle single image upload for a vehicle"""
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)
    
    data = json.loads(request.body)

    vehicle_id = data.get('vehicle_id')
    image_data = data.get('photo')
    is_main = data.get('is_main', False)
    
    if not image_data or not vehicle_id:
        return JsonResponse({"status": "error", "message": "Vehicle ID and image are required"}, status=400)
        
    try:
        vehicle = Vehicle.objects.get(pk=vehicle_id)
        photo = VehiclePhoto.objects.create(
            vehicle=vehicle,
            photo=base64_file(image_data)[0],
            is_main=is_main
        )
        
        return JsonResponse({
            "status": "success",
            "id": photo.id,
            "vehicle_id": vehicle.id,
            "photo_url": photo.photo.url if photo.photo else None
        })
        
    except Vehicle.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Vehicle not found"}, status=404)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)