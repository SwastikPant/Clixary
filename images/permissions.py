from rest_framework import permissions

class CanUploadImage(permissions.BasePermission):
    message = "Only photographers, coordinators, and admins can upload images."
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        if not request.user or not request.user.is_authenticated:
            return False
        
        allowed_roles = ['PHOTOGRAPHER', 'COORDINATOR', 'ADMIN']
        user_role = request.user.profile.role
        
        return user_role in allowed_roles


class CanModifyImage(permissions.BasePermission):
    message = "You can only modify your own images."
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        is_owner = obj.uploaded_by == request.user
        is_admin = request.user.profile.role == 'ADMIN'
        
        print(f" Image permission check:")
        print(f"   User: {request.user.username}")
        print(f"   Image owner: {obj.uploaded_by.username}")
        print(f"   Is owner: {is_owner}")
        print(f"   Is admin: {is_admin}")
        print(f"   Allowed: {is_owner or is_admin}")

        return is_owner or is_admin