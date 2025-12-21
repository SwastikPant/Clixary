from rest_framework import permissions

class CanManageEvent(permissions.BasePermission):

    message = "Only event coordinators and admins can manage events."
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        allowed_roles = ['COORDINATOR', 'ADMIN']
        return request.user.profile.role in allowed_roles


class CanModifyEvent(permissions.BasePermission):
    message = "You can only modify your own events."
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        is_creator = obj.created_by == request.user
        is_admin = request.user.profile.role == 'ADMIN'
        
        return is_creator or is_admin