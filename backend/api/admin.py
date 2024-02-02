from django.contrib import admin

# Register your models here.
from .models import UserProfile, Community, Question, Answer, Conversation, Messages

admin.site.register(UserProfile)
admin.site.register(Community)
admin.site.register(Question)
admin.site.register(Answer)
admin.site.register(Conversation)
admin.site.register(Messages)