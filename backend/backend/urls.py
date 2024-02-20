from django.contrib import admin
from django.urls import path, include
from api.views import (
    SignupView,
    LoginView,
    GetCSRFToken,
    LogoutView,
    DeactivateAccountView,  
    GetUserProfileView,
    GetFriendProfileView,
    GetCommunity,
    GetUser,
    UpdateUserProfileView,
    UpdatePasswordView,
    NotificationView,
    VerifyAccountView,
    analyze_text,
)


urlpatterns = [
    path("admin/", admin.site.urls),

    path("register/", SignupView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view()),
    path('delete/', DeactivateAccountView.as_view()),
    path("csrf_cookie/", GetCSRFToken.as_view()),
    path("get-community/", GetCommunity.as_view()),
    path('user-profile/', GetUserProfileView.as_view()),
    path('friend-profile/<int:user_id>', GetFriendProfileView.as_view()),
    path('verify-account/', VerifyAccountView.as_view()),
    path('user-notifications/', NotificationView.as_view()),
    path('question/', include('question.urls')),
    path('message/', include('message.urls')),

    path('update-profile/', UpdateUserProfileView.as_view()),
    path('update-password/', UpdatePasswordView.as_view()),
    path('getuser/', GetUser.as_view()),

    path("analyze_text/", analyze_text, name="analyze_text"),
    
    path('api/', include('api.urls')),
]
# Add other URLs as needed
