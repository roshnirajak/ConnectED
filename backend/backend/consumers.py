from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
import json

class QuestionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'question_updates'
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        pass

    async def notify_new_question(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_question',
            'question': event['question_data']
        }))
