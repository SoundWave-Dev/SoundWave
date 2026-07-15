from django.urls import path

from apps.playback import views

urlpatterns = [
    path("preferences/me/", views.MyPreferencesView.as_view(), name="preferences-me"),
    path("recently-played/", views.RecentlyPlayedView.as_view(), name="recently-played"),
]
