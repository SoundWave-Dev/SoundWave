from django.urls import path

from apps.accounts import views

urlpatterns = [
    path("register/listener/", views.RegisterListenerView.as_view(), name="register-listener"),
    path("register/artist/", views.RegisterArtistView.as_view(), name="register-artist"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("login/refresh/", views.RefreshTokenView.as_view(), name="login-refresh"),
    path("password/forgot/", views.ForgotPasswordRequestView.as_view(), name="password-forgot"),
    path("password/reset/", views.ForgotPasswordConfirmView.as_view(), name="password-reset"),
    path("me/", views.MeView.as_view(), name="me"),
]
