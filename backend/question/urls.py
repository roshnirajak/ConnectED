from django.urls import path
from .views import (
    AddQuestionView,
    PaginatedQuestionsView,
    AddAnswerView,
    QuestionDetailView,
    ToggleUpvote,
    ToggleDownvote,
    MyQuestions,
    DeleteQuestion,
    AdminDeleteQuestion,
    DeleteAnswer,
    ToggleQuestionReport,
    ToggleAnswerReport,
    GetReportedQuestion,
    GetReportedAnswer,
    AdminDeleteAnswer,

    GetNotificationsIsRead,
    MarkNotificationsIsRead
)

urlpatterns = [
    path("add-question/", AddQuestionView.as_view()),
    path("add-answer/<int:question_id>", AddAnswerView.as_view()),
    path("get-question/", PaginatedQuestionsView.as_view()),
    path("question-detail/<int:question_id>", QuestionDetailView.as_view()),
    path("toggle_upvote/<int:answerid>", ToggleUpvote.as_view()),
    path("toggle_downvote/<int:answerid>", ToggleDownvote.as_view()),
    path("my-questions-data/", MyQuestions.as_view()),
    path("my-questions-delete/<int:question_id>/", DeleteQuestion.as_view()),
    path("my-answer-delete/<int:answer_id>/", DeleteAnswer.as_view()),
    path("toggle-question-report/<int:questionid>/", ToggleQuestionReport.as_view()),
    path("toggle-answer-report/<int:answerid>/", ToggleAnswerReport.as_view()),

    
    path("get-reported-question/", GetReportedQuestion.as_view()),
    path("admin-question-delete/<int:question_id>/", AdminDeleteQuestion.as_view()),
    path("get-reported-answer/", GetReportedAnswer.as_view()),
    path("admin-answer-delete/<int:answer_id>/", AdminDeleteAnswer.as_view()),


    
    path("get-notification-isread/", GetNotificationsIsRead.as_view()),
    path("mark-notification-isread/", MarkNotificationsIsRead.as_view()),
    # Add more paths for your API endpoints as needed
]
