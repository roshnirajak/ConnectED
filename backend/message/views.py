from django.shortcuts import render, redirect
from api.models import UserProfile, Conversation, Messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework import permissions
from django.utils.decorators import method_decorator
from django.views import View
from django.core.paginator import Paginator, EmptyPage
from question.utils import analyze_toxicity
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
import json
from itertools import chain
# Create your views here.
@method_decorator(csrf_protect, name="dispatch")
class SendMessageRequest(View):
    def post(self, request, userId, *args, **kwargs):
        from_user_profile = UserProfile.objects.get(email=request.user)
        to_user_profile = UserProfile.objects.get(user_id=userId)

        conversation = Conversation.objects.create(
            from_user=from_user_profile.user_id,
            to_user=to_user_profile.user_id,
            approval_status="pending",  # Request will remain pending initially
            community_id=from_user_profile.community_id,  # Adjust according to your logic
        )
        return JsonResponse({"message": "Message request sent successfully!"})


@method_decorator(csrf_protect, name="dispatch")
class AcceptMessageRequest(APIView):
    def post(self, request, userId, *args, **kwargs):
        to_user_profile = UserProfile.objects.get(email=request.user)
        from_user_profile = UserProfile.objects.get(user_id=userId)

        conversation = Conversation.objects.create(
            from_user=to_user_profile.user_id,
            to_user=from_user_profile.user_id,
            approval_status="accepted",  # Request will remain pending initially
            community_id=to_user_profile.community_id,  # Adjust according to your logic
        )
        conversation_row = Conversation.objects.filter(
            from_user=from_user_profile.user_id, to_user=to_user_profile.user_id
        ).first()
        print(conversation_row.from_user)
        if conversation_row:
            conversation_row.approval_status = "accepted"
            conversation_row.save()

        message = Messages.objects.create(
            conversation_id=conversation_row.conversation_id,
            content="",
            community_id=conversation_row.community_id,
        )
        return JsonResponse({"message": "Message request accepted successfully!"})


@method_decorator(csrf_protect, name="dispatch")
class GetMessageRequestStatus(View):
    def get(self, request, userId):
        try:
            from_user_profile = UserProfile.objects.get(email=request.user)
            to_user_profile = UserProfile.objects.get(user_id=userId)
            conversation1 = Conversation.objects.filter(
                from_user=from_user_profile.user_id, to_user=to_user_profile.user_id
            ).first()
            conversation2 = Conversation.objects.filter(
                from_user=to_user_profile.user_id, to_user=from_user_profile.user_id
            ).first()
            if conversation1:
                return JsonResponse({"message": conversation1.approval_status})
            elif conversation2:
                return JsonResponse({"message": "Accept Request"})
            else:
                print("hhh1")
                return JsonResponse({"message": "Conversation not found"})

        except Exception as e:
            print("hhh2")
            return JsonResponse({"error": e})


@method_decorator(csrf_protect, name="dispatch")
class RequestReceived(View):
    def get(self, request):
        try:
            current_user_profile = UserProfile.objects.get(email=request.user)
            conversations = Conversation.objects.filter(
                to_user=current_user_profile.user_id, approval_status="pending"
            ).order_by("-timestamp")
            conversation_data = []

            for conversation in conversations:
                user_profile = UserProfile.objects.get(user_id=conversation.from_user)
                conversation_data.append(
                    {
                        "user_id": user_profile.user_id,
                        "full_name": user_profile.full_name,
                        "display_image": user_profile.display_image,
                    }
                )

            return JsonResponse({"conversations": conversation_data})
        except UserProfile.DoesNotExist:
            return JsonResponse({"error": "User profile not found"})
        except Exception as e:
            return JsonResponse({"error": str(e)})


@method_decorator(csrf_protect, name="dispatch")
class RequestSent(View):
    def get(self, request):
        try:
            current_user_profile = UserProfile.objects.get(email=request.user)
            conversations = Conversation.objects.filter(
                from_user=current_user_profile.user_id, approval_status="pending"
            ).order_by("-timestamp")
            conversation_data = []

            for conversation in conversations:
                user_profile = UserProfile.objects.get(user_id=conversation.to_user)
                conversation_data.append(
                    {
                        "user_id": user_profile.user_id,
                        "full_name": user_profile.full_name,
                        "display_image": user_profile.display_image,
                    }
                )

            return JsonResponse({"conversations": conversation_data})
        except UserProfile.DoesNotExist:
            return JsonResponse({"error": "User profile not found"})
        except Exception as e:
            return JsonResponse({"error": str(e)})


@method_decorator(csrf_protect, name="dispatch")
class ShowInbox(View):
    def get(self, request):
        try:
            # Get the current user's profile
            current_user_profile = UserProfile.objects.get(email=request.user)

            # Filter conversations where the current user is the recipient and status is accepted
            conversation_rows = Conversation.objects.filter(
                to_user=current_user_profile.user_id, approval_status="accepted"
            )

            # Get the sender profiles from the filtered conversations
            sender_user_ids = [
                conversation.from_user for conversation in conversation_rows
            ]
            user_profiles = UserProfile.objects.filter(user_id__in=sender_user_ids)

            user_profiles_data = [
                {
                    "sender_user_id": profile.user_id,
                    "sender_full_name": profile.full_name,
                    "sender_email": profile.email,
                    "sender_display_image": profile.display_image,
                    "sender_user_role": profile.user_role,
                }
                for profile in user_profiles
            ]

            return JsonResponse({"user_profiles": user_profiles_data})
        except ObjectDoesNotExist:
            return JsonResponse({"error": "User profile not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


@method_decorator(csrf_protect, name="dispatch")
class SendMessage(View):
    def post(self, request, userId):
        try:
            if request.method == "POST":
                user_profile = UserProfile.objects.get(email=request.user)
                data = json.loads(request.body)
                content = data.get("content")
                conversation = Conversation.objects.filter(
                    to_user=userId, from_user=user_profile.user_id, approval_status="accepted"
                ).first()

                if not conversation:
                    return JsonResponse({"error": "Conversation not found"}, status=404)

                # Save the message to the database
                message = Messages.objects.create(
                    conversation_id=conversation.conversation_id,
                    content=content,
                    community_id=user_profile.community_id,
                )
                return JsonResponse({"message_id": message.message_id}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@method_decorator(csrf_protect, name="dispatch")
class FetchMessages(View):
    def get(self, request, userId):
        try:
            user_profile = UserProfile.objects.get(email=request.user)
            conversation_current_user = Conversation.objects.filter(
                to_user=userId, from_user=user_profile.user_id, approval_status="accepted"
            ).first()
            conversation_friend_user = Conversation.objects.filter(
                to_user=user_profile.user_id, from_user=userId, approval_status="accepted"
            ).first()
            
            messages_current_user = Messages.objects.filter(conversation_id=conversation_current_user.conversation_id)
            messages_friend_user = Messages.objects.filter(conversation_id=conversation_friend_user.conversation_id)
            
            # Combine messages from both users into a single list
            all_messages = sorted(
                chain(messages_current_user, messages_friend_user),
                key=lambda x: x.timestamp
            )
            # Convert messages to JSON format
            messages_data = [
                {
                    "content": message.content,
                    "sender": "current_user" if Conversation.objects.get(conversation_id=message.conversation_id).from_user== user_profile.user_id else "friend_user",
                    "timestamp": message.timestamp,
                }
                for message in all_messages
            ]

            return JsonResponse({"messages": messages_data})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)