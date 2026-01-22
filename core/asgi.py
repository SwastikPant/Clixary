"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Initialize Django ASGI application before importing app modules that may
# import models (importing models before setup() causes AppRegistryNotReady).
django_asgi_app = get_asgi_application()

# Now import Channels routing and application-specific modules. These imports
# may import models or other Django pieces and must happen after Django setup.
from channels.routing import ProtocolTypeRouter, URLRouter
import activities.routing
from activities.middleware import TokenAuthMiddlewareStack

application = ProtocolTypeRouter({
	"http": django_asgi_app,
	"websocket": TokenAuthMiddlewareStack(
		URLRouter(
			activities.routing.websocket_urlpatterns
		)
	),
})
