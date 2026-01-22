from rest_framework import permissions

class CanUploadImage(permissions.BasePermission):
    message = "Only photographers, coordinators, and admins can upload images."
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        if not request.user or not request.user.is_authenticated:
            return False
        
        allowed_roles = ['PHOTOGRAPHER', 'ADMIN']
        user_role = request.user.profile.role
        
        return user_role in allowed_roles


class CanModifyImage(permissions.BasePermission):
    message = "You can only modify your own images."
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        is_owner = obj.uploaded_by == request.user
        is_admin = request.user.profile.role == 'ADMIN'
        

        return is_owner or is_admin