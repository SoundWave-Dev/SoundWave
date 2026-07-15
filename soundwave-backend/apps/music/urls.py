from rest_framework.routers import DefaultRouter

from apps.music.views import AlbumViewSet, TrackViewSet

router = DefaultRouter()
router.register("albums", AlbumViewSet, basename="album")
router.register("tracks", TrackViewSet, basename="track")

urlpatterns = router.urls
