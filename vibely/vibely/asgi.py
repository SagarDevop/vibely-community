import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# Set Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "vibely.settings")

# HTTP application
django_asgi_app = get_asgi_application()

# Import routing for WebSockets
from chat import routing as chat_routing  # Replace 'chat' with your WebSocket app

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            chat_routing.websocket_urlpatterns
        )
    ),
})
