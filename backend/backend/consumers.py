from channels.generic.websocket import AsyncWebsocketConsumer
import json

class QuestionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        pass

    async def notify_new_question(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_question',
            'question': event['question_data']
        }))
