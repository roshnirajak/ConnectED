from django.shortcuts import render, redirect
from django.contrib.auth.hashers import make_password, check_password
from .models import UserProfile, Question, Answer
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
from django.views import View
from django.core.paginator import Paginator, EmptyPage
from .utils import analyze_toxicity
import requests




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
            return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)
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
                "community_id": user_profile.community_id,
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


@method_decorator(csrf_protect, name="dispatch")
class PaginatedQuestionsView(View):
    def get(self, request, *args, **kwargs):
        page_number = request.GET.get('page', 1)
        page_size = 5  # Number of items to display per page

        questions = Question.objects.all().order_by('-created_at')
        paginator = Paginator(questions, page_size)

        try:
            current_page = paginator.page(page_number)
        except EmptyPage:
            return JsonResponse({"error": "No more pages."}, status=400)

        questions_data = []

        for question in current_page.object_list:
            user_profile = UserProfile.objects.get(user_id=question.question_user)
            answer_count = Answer.objects.filter(question_id=question.question_id).count()

            question_data = {
                "question_id": question.question_id,
                "question_content": question.question_content,
                "user_full_name": user_profile.full_name,
                "answer_count": answer_count,
            }

            questions_data.append(question_data)

        return JsonResponse({
            "current_page": current_page.number,
            "total_pages": paginator.num_pages,
            "questions": questions_data,
        })
    
@method_decorator(csrf_protect, name="dispatch")
class QuestionDetailView(View):
    def get(self, request, question_id, *args, **kwargs):
        try:
            # Retrieve the question
            question = Question.objects.get(question_id=question_id)
            
            # Retrieve user profile for the question user
            user_profile = UserProfile.objects.get(user_id=question.question_user)

            # Retrieve answers for the question
            answers = Answer.objects.filter(question_id=question_id).order_by('-created_at')

            # Prepare data for the response
            question_data = {
                "question_id": question.question_id,
                "question_content": question.question_content,
                "user_full_name": user_profile.full_name,
                "created_at": question.created_at,
                "answers": [
                    {
                        "answer_id": answer.answer_id,
                        "answer_content": answer.answer_content,
                        "user_full_name": UserProfile.objects.get(user_id=answer.answer_user).full_name,
                        "upvotes": answer.upvotes,
                        "downvotes": answer.downvotes,
                        "created_at": answer.created_at,
                    }
                    for answer in answers
                ]
            }

            return JsonResponse({"question": question_data})

        except Question.DoesNotExist:
            return JsonResponse({"error": "Question not found"}, status=404)

        except UserProfile.DoesNotExist:
            return JsonResponse({"error": "User profile not found"}, status=404)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
@method_decorator(csrf_protect, name="dispatch")
class AddQuestionView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        try:
            # Try to get the user profile based on the request user's email
            user_profile = UserProfile.objects.get(email=request.user)

            # Extract necessary data from the user profile
            question_user = user_profile.user_id
            question_content = request.data.get("question_content")
            subject = request.data.get("subject")
            community_id = user_profile.community_id

            # Analyze toxicity of the question content
            toxicity_score = analyze_toxicity(question_content)
            
            # Check if the toxicity score is within an acceptable range (e.g., 0.0 to 0.3)
            if 0.0 <= toxicity_score <= 0.3:
                # Create a new question instance
                question = Question(
                    question_content=question_content,
                    question_user=question_user,
                    subject=subject,
                    community_id=community_id,
                )

                # Save the question to the database
                question.save()

                return Response({"success": "Question added successfully"}, status=status.HTTP_201_CREATED)
            else:
                # Reject the request if the toxicity score is too high
                return Response({"error": "Question content is too toxic"}, status=status.HTTP_400_BAD_REQUEST)

        except UserProfile.DoesNotExist:
            # Handle the case where the user profile does not exist
            return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            # Handle other exceptions
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_protect, name="dispatch")
class AddAnswerView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, question_id, *args, **kwargs):
        try:
            # Try to get the user profile based on the request user's email
            user_profile = UserProfile.objects.get(email=request.user)

            # Extract necessary data from the user profile
            answer_user = user_profile.user_id
            answer_content = request.data.get("answer_content")
            question_id = question_id
            community_id = user_profile.community_id

            # Analyze toxicity of the answer content
            toxicity_score = analyze_toxicity(answer_content)

            # Check if the toxicity score is within an acceptable range (e.g., 0.0 to 0.3)
            if 0.0 <= toxicity_score <= 0.3:
                # Create a new answer instance
                answer = Answer(
                    answer_content=answer_content,
                    answer_user=answer_user,
                    question_id=question_id,
                    community_id=community_id,
                )

                # Save the answer to the database
                answer.save()

                return Response({"success": "Answer added successfully"}, status=status.HTTP_201_CREATED)
            else:
                # Reject the request if the toxicity score is too high
                return Response({"error": "Answer content is too toxic"}, status=status.HTTP_400_BAD_REQUEST)

        except UserProfile.DoesNotExist:
            # Handle the case where the user profile does not exist
            return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            # Handle other exceptions
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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



def analyze_text(request):
    if request.method == 'POST':
        text_to_analyze = request.POST.get('text')  # Assuming you have a form with a 'text' field

        # Replace 'YOUR_API_KEY' with your actual Perspective API key
        api_key = 'AIzaSyAAlB6CmUrA7JkcDiiyN6vamy2CnbPg4WQ'
        api_url = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze'

        params = {
            'key': api_key,
        }

        data = {
            'comment': {'text': text_to_analyze},
            'languages': ['en'],  # Specify the language of the text
            'requestedAttributes': {'TOXICITY': {}},
        }

        response = requests.post(api_url, params=params, json=data)

        if response.status_code == 200:
            result = response.json()
            toxicity_score = result['attributeScores']['TOXICITY']['summaryScore']['value']

            return JsonResponse({'toxicity_score': toxicity_score})

        else:
            error_message = f"Error: {response.status_code}, {response.text}"
            return JsonResponse({'error': error_message}, status=500)

    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)