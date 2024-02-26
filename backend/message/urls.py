from django.urls import path
from .views import (
    SendMessageRequest,
    AcceptMessageRequest,
    RejectMessageRequest,
    GetMessageRequestStatus,
    RequestReceived,
    RequestSent,
    ShowInbox,
    SendMessage,
    FetchMessages,
)

urlpatterns = [
    path("send-request/<int:userId>", SendMessageRequest.as_view()),
    path("accept-request/<int:userId>", AcceptMessageRequest.as_view()),
    path("reject-request/<int:userId>", RejectMessageRequest.as_view()),
    path("get-status/<int:userId>", GetMessageRequestStatus.as_view()),
    path("get-request-received/", RequestReceived.as_view()),
    path("get-request-sent/", RequestSent.as_view()),
    path("get-inbox/", ShowInbox.as_view()),
    path("send-message/<int:userId>/", SendMessage.as_view()),
    path("fetch-messages/<int:userId>/", FetchMessages.as_view()),
    # Add more paths for your API endpoints as needed
]