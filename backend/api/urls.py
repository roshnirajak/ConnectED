from django.urls import path
from .views import (
    GetAllMentors,
    GetMentor,
    VerifyMentor,
    AddCommunity,
    GetAllCommunity
)

urlpatterns = [
    path("get_all_mentors/", GetAllMentors.as_view(), name="get_all_mentors"),
    path("get_mentor/<int:user_id>/", GetMentor.as_view(), name="get_mentor"),
    path("verify_mentor/<int:user_id>/", VerifyMentor.as_view()),
    path("add_community/", AddCommunity.as_view()),
    path("get_all_community/", GetAllCommunity.as_view()),
]
