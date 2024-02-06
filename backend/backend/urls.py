from django.contrib import admin
from django.urls import path, include
from api.views import (
    SignupView,
    LoginView,
    GetCSRFToken,
    CheckAuthenticatedView,
    LogoutView,
    DeactivateAccountView,  
    GetUserProfileView,
    GetUser,
    UpdateUserProfileView,
    UpdatePasswordView,
    AddQuestionView,
    PaginatedQuestionsView,
    AddAnswerView,
    QuestionDetailView,

    analyze_text,
    get_all_mentors,
    verify_mentor,
)

urlpatterns = [
    path("admin/", admin.site.urls),

    path("register/", SignupView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("authenticated/", CheckAuthenticatedView.as_view()),
    path("logout/", LogoutView.as_view()),
    path('delete/', DeactivateAccountView.as_view()),
    path("csrf_cookie/", GetCSRFToken.as_view()),
    path('user-profile/', GetUserProfileView.as_view()),
    path('add-question/', AddQuestionView.as_view()),
    path('add-answer/<int:question_id>', AddAnswerView.as_view()),
    path('get-question/', PaginatedQuestionsView.as_view()),
    path('question-detail/<int:question_id>', QuestionDetailView.as_view()),

    path('update-profile/', UpdateUserProfileView.as_view()),
    path('update-password/', UpdatePasswordView.as_view()),
    path('getuser/', GetUser.as_view()),

    path("analyze_text/", analyze_text, name="analyze_text"),

    path("api/get_all_mentors/", get_all_mentors, name="get_all_mentors"),
    path("api/verify_mentor/<int:user_id>/", verify_mentor, name="verify_mentor"),
]
# Add other URLs as needed
