from rest_framework.routers import DefaultRouter

from apps.support.views import ArtistVerificationViewSet, TicketViewSet

router = DefaultRouter()
router.register("tickets", TicketViewSet, basename="ticket")
router.register("artist-verifications", ArtistVerificationViewSet, basename="artist-verification")

urlpatterns = router.urls
