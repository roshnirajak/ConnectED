from django.shortcuts import render, redirect
from api.models import UserProfile, Question, Answer, Notification
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework import permissions
from django.utils.decorators import method_decorator
from django.views import View
from django.core.paginator import Paginator, EmptyPage
from .utils import analyze_toxicity

# Create your views here.
@method_decorator(csrf_protect, name="dispatch")
class PaginatedQuestionsView(View):
    
    permission_classes = (permissions.AllowAny,)

    def get(self, request, *args, **kwargs):
        page_number = request.GET.get('page', 1)
        page_size = 5  # Number of items to display per page

        # Filter questions based on the user's community_id
        user_profile = UserProfile.objects.get(email=request.user)
        user_community_id = user_profile.community_id
        questions = Question.objects.filter(community_id=user_community_id).order_by('-created_at')

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
                        "user_liked": request.user in answer.liked_by.all(),
                        "user_disliked": request.user in answer.disliked_by.all(),
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


@method_decorator(csrf_protect, name="dispatch")
class ToggleUpvote(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, answerid, *args, **kwargs):
        try:
            answer = Answer.objects.get(answer_id=answerid)
            
            # Get the UserProfile instance corresponding to the current user
            user_profile = UserProfile.objects.get(email=request.user)
            id= user_profile.user_id
            print(id)
            if user_profile:
                if user_profile in answer.liked_by.all():
                    # User has already liked the answer, remove like
                    answer.upvotes -= 1
                    answer.liked_by.remove(id)
                else:
                    # User hasn't liked the answer, add like
                    answer.upvotes += 1
                    answer.liked_by.add(id)
                    self.set_rank(answer) 
                answer.save()
                print("After:", answer.liked_by.all())
                return JsonResponse({'status': 'success'})
            else:
                return JsonResponse({'status': 'error', 'message': 'User not authenticated'}, status=403)

        except Answer.DoesNotExist: 
            return JsonResponse({'status': 'error', 'message': 'Answer not found'}, status=404)
        
    def set_rank(self, answer):
        # Retrieve the current number of upvotes for the answer
        upvotes_count = answer.upvotes
        # Get the UserProfile instance of the user who provided the answer
        answer_user_profile = UserProfile.objects.get(user_id=answer.answer_user)
        
        # Set rank based on upvotes count
        if upvotes_count >= 30:
            answer_user_profile.rank = 'Gold'
        elif upvotes_count >= 16:
            answer_user_profile.rank = 'Silver'
        elif upvotes_count >= 2:
            answer_user_profile.rank = 'Bronze'
        else:
            answer_user_profile.rank=""

        if upvotes_count==30:
            message = "Congratulations! You've unlocked a new rank: Gold"
            Notification.objects.create(notified_user=answer_user_profile.user_id, message=message)
        elif upvotes_count == 16:
            message = "Congratulations! You've unlocked a new rank: Silver"
            Notification.objects.create(notified_user=answer_user_profile.user_id, message=message)
        elif upvotes_count == 2:
            message = "Congratulations! You've unlocked a new rank: Bronze"
            Notification.objects.create(notified_user=answer_user_profile.user_id, message=message)
        
        
        # Save the updated rank
        answer_user_profile.save()

@method_decorator(csrf_protect, name="dispatch")
class ToggleDownvote(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, answerid, *args, **kwargs):
        try:
            answer = Answer.objects.get(answer_id=answerid)
            
            # Get the UserProfile instance corresponding to the current user
            user_profile = UserProfile.objects.get(email=request.user)
            id= user_profile.user_id
            print(id)
            if user_profile:
                if user_profile in answer.disliked_by.all():
                    # User has already liked the answer, remove like
                    answer.downvotes += 1
                    answer.disliked_by.remove(id)
                else:
                    # User hasn't liked the answer, add like
                    answer.downvotes -= 1
                    answer.disliked_by.add(id)
                answer.save()
                print("After:", answer.disliked_by.all())
                return JsonResponse({'status': 'success'})
            else:
                return JsonResponse({'status': 'error', 'message': 'User not authenticated'}, status=403)

        except Answer.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Answer not found'}, status=404)
