from django.shortcuts import render, redirect
from django.contrib.auth.hashers import make_password, check_password
from .models import UserProfile
from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt, csrf_protect, ensure_csrf_cookie
from django.contrib.auth import authenticate, login, logout, hashers
from time import time
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.core.files.base import ContentFile
import base64
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.sessions.backends.db import SessionStore
from django.contrib.sessions.models import Session
import datetime
from rest_framework import permissions
from django.utils.decorators import method_decorator
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from .serializers import UserProfileSerializer






@method_decorator(csrf_protect, name="dispatch")
class CheckAuthenticatedView(APIView):
    def get(self, request, format=None):
        try:
            isAuthenticated=request.user.is_authenticated

            if isAuthenticated:
                return Response({"isAuthenticated": "success"})
            else:
                return Response({"isAuthenticated": "error"}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response(
                {"error": f"Error checking authentication status: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@method_decorator(csrf_protect, name="dispatch")
class SignupView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")

        # Check if the email already exists in the database
        if UserProfile.objects.filter(email=email).exists():
            return Response({"error": "Email already exists"})
        else:
            # If the email doesn't exist, proceed with user creation
            full_name = request.data.get("full_name")
            college_name = request.data.get("college_name")
            designation = request.data.get("designation")
            community_id = request.data.get("community_id")
            user_role = request.data.get("user_role")
            display_image_url = f"https://altar.berrysauce.me/generate?data={full_name}"
            password = request.data.get("password")

            hashed_password = make_password(password)

            user = UserProfile(
                full_name=full_name,
                email=email,
                college_name=college_name,
                designation=designation,
                community_id=community_id,
                user_role=user_role,
                display_image=display_image_url,
                password=hashed_password,
            )

            if "mentor_id_card" in request.data:
                mentor_id_card = request.data["mentor_id_card"]
                file_name = f"{user.community_id}_{int(time())}.{mentor_id_card.name.split('.')[-1]}"
                user.mentor_id_card.save(file_name, mentor_id_card)

            user.save()

            return Response({"success": "Registration successful"})


@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")

        # Authenticate user
        user = authenticate(request, email=email, password=password)

        if user is not None:
            # Check if the user is active
            if user.is_active:
                # If the password is correct and the user is active, log in the user
                login(request, user)
                print("Authenticated user:", request.user)
                return Response({"success": "User authenticated", "email": email})
            else:
                return Response(
                    {"message": "Account is inactive"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
        else:
            return Response(
                {"message": "Invalid email or password"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class LogoutView(APIView):
    def post(self, request, format=None):
        try:
            logout(request)
            return Response({"success": "Loggout Out"})
        except:
            return Response({"error": "Something went wrong when logging out"})



class GetCSRFToken(APIView):

    def get(self, request, format=None):
        # Manually set the CSRF cookie with SameSite=None
        csrf_token = get_token(request)
        response = Response({"success": "CSRF cookie set"})
        response.set_cookie("csrftoken", csrf_token)
        return response

#test class
class GetUser(APIView):
    def get(self, request, format=None):
        print("Request:", request)
        print("User:", request.user)
        print("Session:", request.session)
        print("Cookies:", request.COOKIES)

        if request.user.is_authenticated:
            return Response({'is_authenticated'})
        else:
            return Response({'not_authenticated'})

    
@method_decorator(ensure_csrf_cookie, name="dispatch")
class DeactivateAccountView(APIView):
    def post(self, request, format=None):
        email = request.user
        # Retrieve the user by ID or return a 404 response if not found
        user = UserProfile.objects.get(email=email)

        # Deactivate the user account
        user.is_active = False
        user.save()

        return Response(
            {"message": "Account deactivated successfully"}, status=status.HTTP_200_OK
        )


@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetUserProfileView(APIView):
    def get(self, request, format=None):
        try:
            email = request.user

            user_profile = UserProfile.objects.get(email=email)

            serialized_data = {
                "user_id": user_profile.user_id,
                "full_name": user_profile.full_name,
                "email": user_profile.email,
                "college_name": user_profile.college_name,
                "community_id": user_profile.community_id,
                "display_image": user_profile.display_image,
                "user_role": user_profile.user_role,
                "created_at": user_profile.created_at,
            }

            if user_profile.mentor_id_card:
                image_data = user_profile.mentor_id_card.read()
                base64_data = base64.b64encode(image_data).decode("utf-8")
                serialized_data["mentor_id_card_data"] = base64_data

            return Response({"profile": serialized_data, "email": str(email)})

        except UserProfile.DoesNotExist:
            return Response(
                {"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {"error": f"Something went wrong when retrieving profile: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdateUserProfileView(APIView):
    def put(self, request, format=None):
        try:
            user = self.request.user
            email = user.email
            print(email)

            full_name = request.data.get("full_name")
            college_name = request.data.get("college_name")

            # Check if required fields are present in the request data
            if not (full_name and college_name):
                return Response({'error': 'Full name and college name are required fields'}, status=status.HTTP_400_BAD_REQUEST)

            # Update user profile
            UserProfile.objects.filter(email=user).update(full_name=full_name, college_name=college_name)

            # Fetch updated user profile
            user_profile = UserProfile.objects.get(email=email)

            # Serialize user profile data
            serialized_data = {
                "user_id": user_profile.user_id,
                "full_name": user_profile.full_name,
                "email": user_profile.email,
                "college_name": user_profile.college_name,
                "community_id": user_profile.community_id,
                "display_image": user_profile.display_image,
                "user_role": user_profile.user_role,
                "created_at": user_profile.created_at,
            }

            # Include mentor_id_card_data if available
            if user_profile.mentor_id_card:
                image_data = user_profile.mentor_id_card.read()
                base64_data = base64.b64encode(image_data).decode("utf-8")
                serialized_data["mentor_id_card_data"] = base64_data

            return Response({"profile": serialized_data, "email": str(email)})

        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({'error': f'Something went wrong when updating profile: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdatePasswordView(APIView):
    def put(self, request, format=None):
        try:
            user = self.request.user
            email = user.email

            data = self.request.data
            old_password = data.get('old_password')
            new_password = data.get('new_password')

            # Check if required fields are present in the request data
            if not (old_password and new_password):
                return Response({'error': 'Old password and new password are required fields'}, status=status.HTTP_400_BAD_REQUEST)

            # Check if old password matches
            if not hashers.check_password(old_password, user.password):
                return Response({'error': 'Invalid old password'}, status=status.HTTP_401_UNAUTHORIZED)

            # Hash and update the new password
            user.set_password(new_password)
            user.save()

            return Response({'success': 'Password updated successfully'})

        except Exception as e:
            return Response({'error': f'Something went wrong when updating password: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def get_user_profile(request):
    # Get user email from the request or session
    user_email = request.GET.get(
        "email"
    ) 

    try:
        user_profile = UserProfile.objects.get(email=user_email)
        # Serialize the user_profile data if needed
        serialized_data = {
            "id": user_profile.user_id,
            "full_name": user_profile.full_name,
            "email": user_profile.email,
            "college_name": user_profile.college_name,
            "community_id": user_profile.community_id,
            "display_image": user_profile.display_image,
            "user_role": user_profile.user_role,
            "created_at": user_profile.created_at,
        }
        if user_profile.mentor_id_card:
            image_data = user_profile.mentor_id_card.read()
            base64_data = base64.b64encode(image_data).decode("utf-8")
            serialized_data["mentor_id_card_data"] = base64_data
        return Response(serialized_data)
    except UserProfile.DoesNotExist:
        return Response({"error": "User not found"}, status=404)


def get_all_mentors(request):
    if request.method == "GET":
        # Filter mentors with user_role 0 or 1
        mentors_data = UserProfile.objects.filter(user_role__in=["0", "1"]).values()
        return JsonResponse(list(mentors_data), safe=False)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=400)


def verify_mentor(request, user_id):
    try:
        user_profile = UserProfile.objects.get(user_id=user_id)
        user_profile.user_role = "1"
        user_profile.save()
        return JsonResponse({"message": "Mentor verified successfully"})
    except UserProfile.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": f"Something went wrong: {str(e)}"}, status=500)
