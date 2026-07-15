from rest_framework.routers import DefaultRouter

from apps.playlists.views import PlaylistViewSet

router = DefaultRouter()
router.register("", PlaylistViewSet, basename="playlist")

urlpatterns = router.urls
