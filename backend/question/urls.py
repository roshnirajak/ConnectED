from django.urls import path
from .views import (
    AddQuestionView,
    PaginatedQuestionsView,
    AddAnswerView,
    QuestionDetailView,
    ToggleUpvote,
    ToggleDownvote
)

urlpatterns = [
    path("add-question/", AddQuestionView.as_view()),
    path("add-answer/<int:question_id>", AddAnswerView.as_view()),
    path("get-question/", PaginatedQuestionsView.as_view()),
    path("question-detail/<int:question_id>", QuestionDetailView.as_view()),
    path("toggle_upvote/<int:answerid>", ToggleUpvote.as_view()),
    path("toggle_downvote/<int:answerid>", ToggleDownvote.as_view()),
    # Add more paths for your API endpoints as needed
]
