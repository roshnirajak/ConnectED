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
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q



# Create your views here.
@method_decorator(csrf_protect, name="dispatch")
class PaginatedQuestionsView(View):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, *args, **kwargs):
        try:
            page_number = int(request.GET.get("page", 1))
            page_size = 5  # Number of items to display per page

            user_profile = UserProfile.objects.get(email=request.user)
            current_user_community_id = user_profile.community_id
            current_user_id = user_profile.user_id

            questions = Question.objects.filter(
                community_id=current_user_community_id, is_active__in = [True]
            ).order_by("-created_at")

            paginator = Paginator(questions, page_size)

            try:
                current_page = paginator.page(page_number)
            except EmptyPage:
                return JsonResponse({"error": "No more pages."}, status=400)

            questions_data = []

            for question in current_page.object_list:
                  # Check if question is active
                user_profile = UserProfile.objects.get(
                        user_id=question.question_user
                    )
                answer_count = Answer.objects.filter(
                        question_id=question.question_id, is_active__in=[True]
                    ).count()

                question_data = {
                    "question_id": question.question_id,
                    "question_user": question.question_user,
                    "question_content": question.question_content,
                    "user_full_name": user_profile.full_name,
                    "display_image": user_profile.display_image,
                    "user_role": user_profile.user_role,
                    "answer_count": answer_count,
                    "self_user": current_user_id == question.question_user,
                }

                questions_data.append(question_data)

            return JsonResponse(
                {
                    "current_page": current_page.number,
                    "total_pages": paginator.num_pages,
                    "questions": questions_data,
                    "community": current_user_community_id,  # Include community ID
                }
            )
        except UserProfile.DoesNotExist:
            return JsonResponse({"error": "User profile does not exist."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


@method_decorator(csrf_protect, name="dispatch")
class DeleteQuestion(View):
    permission_classes = (permissions.AllowAny,)
    def post(self, request, question_id):
        try:
            # Check if the user is authenticated
            if request.user:
                # Retrieve the question
                question = Question.objects.get(question_id=question_id)
                user_profile = UserProfile.objects.get(email=request.user)
                # Check if the user owns the question or has permission to delete it
                if question.question_user == user_profile.user_id:
                    # Set the question as inactive
                    question.is_active = False
                    question.save()
                    return JsonResponse({"message": "Question deleted successfully"})
                else:
                    return JsonResponse(
                        {
                            "error": "Unauthorized access. You do not have permission to delete this question."
                        },
                        status=403,
                    )
            else:
                return JsonResponse(
                    {
                        "error": "User not authenticated. Please log in to delete the question."
                    },
                    status=401,
                )
        except Question.DoesNotExist:
            return JsonResponse({"error": "Question not found."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


@method_decorator(csrf_protect, name="dispatch")
class DeleteAnswer(View):
    permission_classes = (permissions.AllowAny,)
    def post(self, request, answer_id):
        try:
            # Check if the user is authenticated
            if request.user:
                # Retrieve the question
                answer = Answer.objects.get(answer_id=answer_id)
                user_profile = UserProfile.objects.get(email=request.user)
                # Check if the user owns the question or has permission to delete it
                if answer.answer_user == user_profile.user_id:
                    # Set the question as inactive
                    answer.is_active = False
                    answer.save()
                    return JsonResponse({"message": "Answer deleted successfully"})
                else:
                    return JsonResponse(
                        {
                            "error": "Unauthorized access. You do not have permission to delete this question."
                        },
                        status=403,
                    )
            else:
                return JsonResponse(
                    {
                        "error": "User not authenticated. Please log in to delete the question."
                    },
                    status=401,
                )
        except Question.DoesNotExist:
            return JsonResponse({"error": "Question not found."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


@method_decorator(csrf_protect, name="dispatch")
class AdminDeleteQuestion(View):
    permission_classes = (permissions.AllowAny,)
    def post(self, request, question_id):
        try:
            question = Question.objects.get(question_id=question_id)
            question.is_active = False
            question.save()
            return JsonResponse({"message": "Question deleted successfully"})
           
        except Question.DoesNotExist:
            return JsonResponse({"error": "Question not found."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@method_decorator(csrf_protect, name="dispatch")
class AdminDeleteAnswer(View):
    permission_classes = (permissions.AllowAny,)
    def post(self, request, answer_id):
        try:
            answer = Answer.objects.get(answer_id=answer_id)
            answer.is_active = False
            answer.save()
            return JsonResponse({"message": "Answer deleted successfully"})
           
        except Question.DoesNotExist:
            return JsonResponse({"error": "Question not found."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@method_decorator(csrf_protect, name="dispatch")
class QuestionDetailView(View):
    def get(self, request, question_id, *args, **kwargs):
        try:
            current_user_profile = UserProfile.objects.get(email=request.user)
            current_user_id = current_user_profile.user_id

            # Retrieve the question
            question = Question.objects.get(question_id=question_id)

            # Retrieve user profile for the question user
            user_profile = UserProfile.objects.get(user_id=question.question_user)

            # Retrieve answers for the question
            answers = Answer.objects.filter(question_id=question_id, is_active__in=[True]).order_by(
                "-created_at"
            )

            # Prepare data for the response
            question_data = {
                "question_id": question.question_id,
                "question_user": question.question_user,
                "question_content": question.question_content,
                "user_full_name": user_profile.full_name,
                "user_role": user_profile.user_role,
                "display_image": user_profile.display_image,
                "created_at": question.created_at,
                "report_count": question.report_count,
                "user_reported": request.user in question.reported_by.all(),
                "self_user": current_user_id == question.question_user,
                "answers": [
                    {
                        "answer_id": answer.answer_id,
                        "answer_user": answer.answer_user,
                        "answer_content": answer.answer_content,
                        "user_role": UserProfile.objects.get(
                            user_id=answer.answer_user
                        ).user_role,
                        "user_full_name": UserProfile.objects.get(
                            user_id=answer.answer_user
                        ).full_name,
                        "display_image": UserProfile.objects.get(
                            user_id=answer.answer_user
                        ).display_image,
                        "upvotes": answer.upvotes,
                        "downvotes": answer.downvotes,
                        "report_count": answer.report_count,
                        "created_at": answer.created_at,
                        "user_liked": request.user in answer.liked_by.all(),
                        "user_reported": request.user in answer.reported_by.all(),
                        "user_disliked": request.user in answer.disliked_by.all(),
                        "self_user": current_user_id == answer.answer_user,
                    }
                    for answer in answers
                ],
            }

            return JsonResponse({"question": question_data})

        except Question.DoesNotExist:
            return JsonResponse({"error": "Question not found"}, status=404)

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

                return Response(
                    {"success": "Question added successfully"},
                    status=status.HTTP_201_CREATED,
                )
            else:
                # Reject the request if the toxicity score is too high
                return Response(
                    {"error": "Question content is too toxic"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except UserProfile.DoesNotExist:
            # Handle the case where the user profile does not exist
            return Response(
                {"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            # Handle other exceptions
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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

                return Response(
                    {"success": "Answer added successfully"},
                    status=status.HTTP_201_CREATED,
                )
            else:
                # Reject the request if the toxicity score is too high
                return Response(
                    {"error": "Answer content is too toxic"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except UserProfile.DoesNotExist:
            # Handle the case where the user profile does not exist
            return Response(
                {"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            # Handle other exceptions
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_protect, name="dispatch")
class ToggleUpvote(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, answerid, *args, **kwargs):
        try:
            answer = Answer.objects.get(answer_id=answerid)

            # Get the UserProfile instance corresponding to the current user
            user_profile = UserProfile.objects.get(email=request.user)
            id = user_profile.user_id
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
                return JsonResponse({"status": "success"})
            else:
                return JsonResponse(
                    {"status": "error", "message": "User not authenticated"}, status=403
                )

        except Answer.DoesNotExist:
            return JsonResponse(
                {"status": "error", "message": "Answer not found"}, status=404
            )

    def set_rank(self, answer):
        # Retrieve the current number of upvotes for the answer
        upvotes_count = answer.upvotes
        # Get the UserProfile instance of the user who provided the answer
        answer_user_profile = UserProfile.objects.get(user_id=answer.answer_user)

        # Set rank based on upvotes count
        if upvotes_count >= 30:
            answer_user_profile.rank = "Gold"
        elif upvotes_count >= 16:
            answer_user_profile.rank = "Silver"
        elif upvotes_count >= 2:
            answer_user_profile.rank = "Bronze"
        else:
            answer_user_profile.rank = ""

        if upvotes_count == 30:
            message = "Congratulations! You've unlocked a new rank: Gold"
            Notification.objects.create(
                notified_user=answer_user_profile.user_id, message=message
            )
        elif upvotes_count == 16:
            message = "Congratulations! You've unlocked a new rank: Silver"
            Notification.objects.create(
                notified_user=answer_user_profile.user_id, message=message
            )
        elif upvotes_count == 2:
            message = "Congratulations! You've unlocked a new rank: Bronze"
            Notification.objects.create(
                notified_user=answer_user_profile.user_id, message=message
            )

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
            id = user_profile.user_id
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
                return JsonResponse({"status": "success"})
            else:
                return JsonResponse(
                    {"status": "error", "message": "User not authenticated"}, status=403
                )

        except Answer.DoesNotExist:
            return JsonResponse(
                {"status": "error", "message": "Answer not found"}, status=404
            )

@method_decorator(csrf_protect, name="dispatch")
class ToggleQuestionReport(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, questionid, *args, **kwargs):
        try:
            question = Question.objects.get(question_id=questionid)

            # Get the UserProfile instance corresponding to the current user
            user_profile = UserProfile.objects.get(email=request.user)
            id = user_profile.user_id
            print(id)
            if user_profile:
                if user_profile in question.reported_by.all():
                    # User has already liked the answer, remove like
                    question.report_count -= 1
                    question.reported_by.remove(id)
                else:
                    # User hasn't liked the answer, add like
                    question.report_count += 1
                    question.reported_by.add(id)
                question.save()
                print("After:", question.reported_by.all())
                return JsonResponse({"status": "success"})
            else:
                return JsonResponse(
                    {"status": "error", "message": "User not authenticated"}, status=403
                )

        except Answer.DoesNotExist:
            return JsonResponse(
                {"status": "error", "message": "Answer not found"}, status=404
            )
        

@method_decorator(csrf_protect, name="dispatch")
class ToggleAnswerReport(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, answerid, *args, **kwargs):
        try:
            answer = Answer.objects.get(answer_id=answerid)

            # Get the UserProfile instance corresponding to the current user
            user_profile = UserProfile.objects.get(email=request.user)
            id = user_profile.user_id
            print(id)
            if user_profile:
                if user_profile in answer.reported_by.all():
                    # User has already liked the answer, remove like
                    answer.report_count -= 1
                    answer.reported_by.remove(id)
                else:
                    # User hasn't liked the answer, add like
                    answer.report_count += 1
                    answer.reported_by.add(id)
                answer.save()
                print("After:", answer.reported_by.all())
                return JsonResponse({"status": "success"})
            else:
                return JsonResponse(
                    {"status": "error", "message": "User not authenticated"}, status=403
                )

        except Answer.DoesNotExist:
            return JsonResponse(
                {"status": "error", "message": "Answer not found"}, status=404
            )

class MyQuestions(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, *args, **kwargs):
        try:
            user_profile = UserProfile.objects.get(email=request.user)
            questions = Question.objects.filter(
                question_user=user_profile.user_id, is_active__in=[True]
            ).order_by("-created_at")

            questions_data = []

            for question in questions:
                try:
                    user_profile = UserProfile.objects.get(
                        user_id=question.question_user
                    )
                except ObjectDoesNotExist:
                    continue  # Skip this question if the user profile doesn't exist

                answer_count = Answer.objects.filter(
                    question_id=question.question_id
                ).count()

                question_data = {
                    "question_id": question.question_id,
                    "question_user": question.question_user,
                    "question_content": question.question_content,
                    "user_full_name": user_profile.full_name,
                    "display_image": user_profile.display_image,
                    "user_role": user_profile.user_role,
                    "answer_count": answer_count,
                    "self_user": user_profile.user_id == question.question_user,
                }
                questions_data.append(question_data)

            return Response({"questions": questions_data})
        except Exception as e:
            return Response({"error": str(e)})


# Admin Section
@method_decorator(csrf_protect, name="dispatch")
class GetReportedQuestion(View):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, *args, **kwargs):
        try:
            questions = Question.objects.filter(
                Q(report_count__gt=0), is_active__in = [True]
            ).order_by("-created_at")
            
            questions_data = []

            for question in questions:
                  # Check if question is active
                user_profile = UserProfile.objects.get(
                        user_id=question.question_user
                    )
                answer_count = Answer.objects.filter(
                        question_id=question.question_id, is_active__in=[True]
                    ).count()

                question_data = {
                    "question_id": question.question_id,
                    "question_user": question.question_user,
                    "question_content": question.question_content,
                    "report_count": question.report_count,
                    "user_full_name": user_profile.full_name,
                    "display_image": user_profile.display_image,
                    "user_role": user_profile.user_role,
                    "community":user_profile.community_id,
                    "answer_count": answer_count,
                }

                questions_data.append(question_data)

            return JsonResponse(
                {
                    "questions": questions_data,
                }
            )
        except UserProfile.DoesNotExist:
            return JsonResponse({"error": "User profile does not exist."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        

@method_decorator(csrf_protect, name="dispatch")
class GetReportedAnswer(View):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, *args, **kwargs):
        try:
            answers = Answer.objects.filter(
                Q(report_count__gt=0), is_active__in = [True]
            ).order_by("-created_at")
            
            answers_data = []

            for answer in answers:
                  # Check if question is active
                user_profile = UserProfile.objects.get(
                        user_id=answer.answer_user
                    )

                answer_data = {
                    "answer_id": answer.answer_id,
                    "answer_user": answer.answer_user,
                    "answer_content": answer.answer_content,
                    "report_count": answer.report_count,
                    "user_full_name": user_profile.full_name,
                    "display_image": user_profile.display_image,
                    "user_role": user_profile.user_role,
                    "community":user_profile.community_id,

                }

                answers_data.append(answer_data)

            return JsonResponse(
                {
                    "questions": answers_data,
                }
            )
        except UserProfile.DoesNotExist:
            return JsonResponse({"error": "User profile does not exist."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        


@method_decorator(csrf_protect, name="dispatch")
class GetNotificationsIsRead(View):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, *args, **kwargs):
        user_profile = UserProfile.objects.get(email=request.user)
        notifications = Notification.objects.filter(notified_user=user_profile.user_id)

        notification_data = [{'id': notification.id, 'notified_user':notification.notified_user, 'is_read': notification.is_read} for notification in notifications]

        print(notification_data)

         # Check if any notification has is_read=False
        notifications_are_read = all(notification.is_read for notification in notifications)

        return JsonResponse({'notifications': notification_data, 'notifications_are_read': notifications_are_read})

@method_decorator(csrf_protect, name="dispatch")
class MarkNotificationsIsRead(View):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        
        user_profile = UserProfile.objects.get(email=request.user)
        Notification.objects.filter(notified_user=user_profile.user_id).update(is_read=True)

        return JsonResponse({'message': 'Notifications marked as read.'})

