import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        # ACCEPT FIRST (important)
        await self.accept()

        # THEN add to group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        message_text = data.get("message")
        sender_id = data.get("sender")

        user1_id, user2_id = self.room_name.split("_")
        receiver_id = user2_id if str(sender_id) == user1_id else user1_id

        message = await self.save_message(
            sender_id,
            receiver_id,
            message_text
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "id": message.id,
                "message": message.text,
                "sender": message.sender_id,
                "receiver": message.receiver_id,
                "timestamp": message.timestamp.isoformat(),
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, text):
        return Message.objects.create(
            sender_id=sender_id,
            receiver_id=receiver_id,
            text=text
        )
