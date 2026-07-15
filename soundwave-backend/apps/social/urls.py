from django.urls import path

from apps.social import views

urlpatterns = [
    path("users/<int:user_id>/follow-stats/", views.FollowStatsView.as_view(), name="follow-stats"),
    path("users/<int:user_id>/follow/", views.FollowToggleView.as_view(), name="follow-toggle"),
]
