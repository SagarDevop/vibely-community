import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
import accounts.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "vibely.settings")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(accounts.routing.websocket_urlpatterns)
    ),
})
