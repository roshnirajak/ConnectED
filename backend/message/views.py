from django.shortcuts import render, redirect
from api.models import UserProfile, Conversation
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
               
        except:
          print("hhh2")
          return JsonResponse({"message": "User profile not found"})
