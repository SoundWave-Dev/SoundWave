from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.accounts import views

router = DefaultRouter()
router.register("artists", views.PublicArtistProfileViewSet, basename="public-artist-profile")
router.register("users", views.PublicUserProfileViewSet, basename="public-user-profile")

urlpatterns = [
    path("register/listener/", views.RegisterListenerView.as_view(), name="register-listener"),
    path("register/artist/", views.RegisterArtistView.as_view(), name="register-artist"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("login/refresh/", views.RefreshTokenView.as_view(), name="login-refresh"),
    path("password/forgot/", views.ForgotPasswordRequestView.as_view(), name="password-forgot"),
    path("password/reset/", views.ForgotPasswordConfirmView.as_view(), name="password-reset"),
    path("password/change/", views.ChangePasswordView.as_view(), name="password-change"),
    path("me/", views.MeView.as_view(), name="me"),
] + router.urls
