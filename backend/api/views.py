from django.shortcuts import render, redirect
from django.contrib.auth.hashers import make_password, check_password
from .models import Community, UserProfile, Notification
from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt, csrf_protect, ensure_csrf_cookie
from django.contrib.auth import authenticate, login, logout, hashers
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from time import time
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.core.files.base import ContentFile
import base64
import datetime
from rest_framework import permissions
from django.utils.decorators import method_decorator
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
import requests
import random
import string
from django.core.mail import send_mail
from django.conf import settings
import smtplib
@method_decorator(csrf_protect, name="dispatch")
class SignupView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")

        # Check if the email already exists in the database
        if UserProfile.objects.filter(email=email).exists():
            return Response(
                {"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST
            )
        else:
            # If the email doesn't exist, proceed with user creation
            full_name = request.data.get("full_name")
            college_name = request.data.get("college_name")
            designation = request.data.get("designation")
            community_id = request.data.get("community_id")
            user_role = request.data.get("user_role")
            display_image_url = f"https://altar.berrysauce.me/generate?data={full_name}"

            # Hash the password
            hashed_password = make_password(password)

            verification_code = "".join(random.choices(string.digits, k=4))

            userProfile = UserProfile(
                full_name=full_name,
                email=email,
                college_name=college_name,
                designation=designation,
                community_id=community_id,
                user_role=user_role,
                display_image=display_image_url,
                password=hashed_password,
                verification_code=verification_code
            )
            if "mentor_id_card" in request.data:
                mentor_id_card = request.data["mentor_id_card"]
                file_name = f"{userProfile.community_id}_{int(time())}.{mentor_id_card.name.split('.')[-1]}"
                userProfile.mentor_id_card.save(file_name, mentor_id_card)

            # Save the user profile
            userProfile.save()

            print(f"New user created: {email}")

            # Send verification email
            send_mail(
                subject="Account Verification Code",
                message=f"Your verification code is: {verification_code}",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
            )

            # Authenticate the user
            user = authenticate(request, email=email, password=password)
            print(f"Authenticated user: {user}")

            if user is not None:
                # Login the user
                login(request, user)
                print(f"Logged in user: {request.user}")

            return Response({"success": "Registration successful"})


@method_decorator(csrf_protect, name="dispatch")
class VerifyAccountView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        verification_code_entered = request.data.get("verification_code")
        print(request.user)
        # Get the user object from the database
        user_profile = UserProfile.objects.get(email=request.user)

        # Compare the entered verification code with the one stored in the database
        if verification_code_entered == user_profile.verification_code:
            # Update the user's is_active status to True
            user_profile.is_active = True   
            user_profile.save()

            return Response({"success": "Account verified successfully", "email": user_profile.email, "user_role": user_profile.user_role}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid verification code"}, status=status.HTTP_400_BAD_REQUEST)
        
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
                return Response({"success": "User authenticated", "email": email, "user_role": user.user_role})
            else:
                return Response(
                    {"error": "Account is inactive"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
        else:
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class LogoutView(APIView):
    def post(self, request, format=None):
        try:
            logout(request)
            response = Response({"success": "Logged Out"})
            return response
        except Exception as e:
            return Response({"error": e})


class GetCSRFToken(APIView):
    def get(self, request, format=None):
        # Manually set the CSRF cookie with SameSite=None
        csrf_token = get_token(request)
        response = Response({"success": "CSRF cookie set"})
        response.set_cookie("csrftoken", csrf_token)
        return response



@method_decorator(ensure_csrf_cookie, name="dispatch")
class GetCommunity(APIView):
    def get(self, request, format=None):
        email = request.user
        # Retrieve the user by ID or return a 404 response if not found
        user_profile = UserProfile.objects.get(email=email)

        return Response(
            {"email":user_profile.email, "community": user_profile.community_id})


# test class
class GetUser(APIView):
    def get(self, request, format=None):
        print("Request:", request)
        print("User:", request.user)
        print("Session:", request.session)
        print("Cookies:", request.COOKIES)

        if request.user.is_authenticated:
            return Response({"is_authenticated"})
        else:
            return Response({"not_authenticated"})


@method_decorator(ensure_csrf_cookie, name="dispatch")
class DeactivateAccountView(APIView):
    def post(self, request, format=None):
        email = request.user
        # Retrieve the user by ID or return a 404 response if not found
        user_profile = UserProfile.objects.get(email=email)

        # Deactivate the user account
        user_profile.is_active = False
        user_profile.save()

        return Response(
            {"message": "Account deactivated successfully"}, status=status.HTTP_200_OK
        )


@method_decorator(ensure_csrf_cookie, name="dispatch")
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
                "designation": user_profile.designation,
                "community_id": user_profile.community_id,
                "display_image": user_profile.display_image,
                "user_role": user_profile.user_role,
                "rank": user_profile.rank,
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
                return Response(
                    {"error": "Full name and college name are required fields"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Update user profile
            UserProfile.objects.filter(email=user).update(
                full_name=full_name, college_name=college_name
            )

            # Fetch updated user profile
            user_profile = UserProfile.objects.get(email=email)

            # Serialize user profile data
            serialized_data = {
                "user_id": user_profile.user_id,
                "full_name": user_profile.full_name,
                "email": user_profile.email,
                "community_id": user_profile.community_id,
            }

            # Include mentor_id_card_data if available
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
                {"error": f"Something went wrong when updating profile: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdatePasswordView(APIView):
    def put(self, request, format=None):
        try:
            user = self.request.user
            email = user.email

            data = self.request.data
            old_password = data.get("old_password")
            new_password = data.get("new_password")

            # Check if required fields are present in the request data
            if not (old_password and new_password):
                return Response(
                    {"error": "Old password and new password are required fields"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Check if old password matches
            if not hashers.check_password(old_password, user.password):
                return Response(
                    {"error": "Invalid old password"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            # Hash and update the new password
            user.set_password(new_password)
            user.save()

            return Response({"success": "Password updated successfully"})

        except Exception as e:
            return Response(
                {"error": f"Something went wrong when updating password: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@method_decorator(csrf_protect, name="dispatch")
class NotificationView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            # Get notifications for the current user
            user_profile = UserProfile.objects.get(email=request.user)
            notifications = Notification.objects.filter(
                notified_user=user_profile.user_id
            )

            # Serialize notifications to JSON
            serialized_notifications = [
                {
                    "id": notification.id,
                    "message": notification.message,
                    # Add other fields as needed
                }
                for notification in notifications
            ]

            return JsonResponse({"notifications": serialized_notifications})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


@method_decorator(csrf_protect, name="dispatch")
class GetFriendProfileView(APIView):
    def get(self, request, user_id, format=None):
        try:
            user_profile = UserProfile.objects.get(user_id=user_id)
            serialized_data = {
                "user_id": user_profile.user_id,
                "full_name": user_profile.full_name,
                "email": user_profile.email,
                "college_name": user_profile.college_name,
                "designation": user_profile.designation,
                "community_id": user_profile.community_id,
                "display_image": user_profile.display_image,
                "user_role": user_profile.user_role,
                "created_at": user_profile.created_at,
            }
            if user_profile.mentor_id_card:
                image_data = user_profile.mentor_id_card.read()
                base64_data = base64.b64encode(image_data).decode("utf-8")
                serialized_data["mentor_id_card_data"] = base64_data
            return Response(
                {"profile": serialized_data, "email": str(user_profile.email)}
            )
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Something went wrong when retrieving profile: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# Admin Side
@method_decorator(csrf_protect, name="dispatch")
class AddCommunity(APIView):
    def post(self, request, format=None):
        name = request.data.get('name')
        id = request.data.get('id')
        community = Community(
                community_name=name,
                community_id=id
            )
            # Save the user profile
        community.save() 
        
        return Response({'id': community.community_id, 'name': community.community_name}, status=status.HTTP_201_CREATED)

@method_decorator(csrf_protect, name="dispatch")
class GetAllCommunity(APIView):
    def get(self, format=None):
        communities = Community.objects.all() 
        community_data = [] 
        
        for community in communities:
            community_info = {
                "community_id": community.community_id,
                "community_name": community.community_name,
            }
            community_data.append(community_info)  
        
        return Response({"communities": community_data})


class GetAllMentors(APIView):
    @method_decorator(csrf_protect)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get(self, request):
        if request.user:  # Check if user is authenticated
            try: 
                mentors_data = UserProfile.objects.filter(user_role__in=["0", "1", "3"]).order_by('-created_at').values()
                mentors_list = list(mentors_data)
                return JsonResponse({"mentors": mentors_list}, safe=False)
            except UserProfile.DoesNotExist:
                return JsonResponse({"error": "User profile not found"}, status=404)
        else:
            return JsonResponse({"error": "Authentication required"}, status=401)

@method_decorator(csrf_protect, name="dispatch")
class GetMentor(APIView):
    def get(self, request, user_id):
        if request.user:  
            try:
                # mentor_data = UserProfile.objects.filter(user_id=user_id).values().first()
                user_profile = UserProfile.objects.get(user_id=user_id)
                # Serialize the user_profile data if needed
                serialized_data = {
                    "user_id": user_profile.user_id,
                    "full_name": user_profile.full_name,
                    "email": user_profile.email,
                    "college_name": user_profile.college_name,
                    "designation": user_profile.designation,
                    "community_id": user_profile.community_id,
                    "display_image": user_profile.display_image,
                    "user_role": user_profile.user_role,
                    "created_at": user_profile.created_at,
                }
                if user_profile.mentor_id_card:
                    image_data = user_profile.mentor_id_card.read()
                    base64_data = base64.b64encode(image_data).decode("utf-8")
                    serialized_data["mentor_id_card_data"] = base64_data
                    
                return Response({"mentors":serialized_data})
            except UserProfile.DoesNotExist:
                return JsonResponse({"error": "User profile not found"}, status=404)
        else:
            return JsonResponse({"error": "Authentication required"}, status=401)


@method_decorator(csrf_protect, name="dispatch")
class VerifyMentor(APIView):
    def post(self, request, user_id):
        try:
            if request.user:  # Check if the user is authenticated
                print(request.user)
                user_profile = UserProfile.objects.get(user_id=user_id)
                user_profile.user_role = "1"  # Assuming '1' represents the role of a verified mentor
                user_profile.save()
                return JsonResponse({"message": "Mentor verified successfully"})
            else:
                return JsonResponse({"error": "Authentication required"}, status=401)
        except UserProfile.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": f"Something went wrong: {str(e)}"}, status=500)

@method_decorator(csrf_protect, name="dispatch")
class RemoveMentor(APIView):
    def post(self, request, user_id):
        try:
            if request.user:  # Check if the user is authenticated
                print(request.user)
                user_profile = UserProfile.objects.get(user_id=user_id)
                user_profile.user_role = "3"  # Assuming '1' represents the role of a verified mentor
                user_profile.save()
                return JsonResponse({"message": "Mentor removed successfully"})
            else:
                return JsonResponse({"error": "Authentication required"}, status=401)
        except UserProfile.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": f"Something went wrong: {str(e)}"}, status=500)

def analyze_text(request):
    if request.method == "POST":
        text_to_analyze = request.POST.get(
            "text"
        ) 

        api_key = "AIzaSyAAlB6CmUrA7JkcDiiyN6vamy2CnbPg4WQ"
        api_url = "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze"

        params = {
            "key": api_key,
        }

        data = {
            "comment": {"text": text_to_analyze},
            "languages": ["en"], 
            "requestedAttributes": {"TOXICITY": {}},
        }

        response = requests.post(api_url, params=params, json=data)

        if response.status_code == 200:
            result = response.json()
            toxicity_score = result["attributeScores"]["TOXICITY"]["summaryScore"][
                "value"
            ]

            return JsonResponse({"toxicity_score": toxicity_score})

        else:
            error_message = f"Error: {response.status_code}, {response.text}"
            return JsonResponse({"error": error_message}, status=500)

    else:
        return JsonResponse({"error": "Invalid request method"}, status=400)
