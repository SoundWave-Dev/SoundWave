from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/billing/", include("apps.billing.urls")),
    path("api/v1/notifications/", include("apps.notifications.urls")),
    path("api/v1/support/", include("apps.support.urls")),
    path("api/v1/music/", include("apps.music.urls")),
    path("api/v1/playback/", include("apps.playback.urls")),
    path("api/v1/playlists/", include("apps.playlists.urls")),
    path("api/v1/social/", include("apps.social.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
