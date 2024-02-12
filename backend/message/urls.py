from django.urls import path
from .views import (
    SendMessageRequest,
    GetMessageRequestStatus
)

urlpatterns = [
    path("send-request/<int:userId>", SendMessageRequest.as_view()),
    path("get-status/<int:userId>", GetMessageRequestStatus.as_view()),
    # Add more paths for your API endpoints as needed
]