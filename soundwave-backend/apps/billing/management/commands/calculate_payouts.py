from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import ArtistProfile
from apps.billing.models import Payout
from apps.music.models import StreamEvent


class Command(BaseCommand):
    """Calculates each approved artist's payout for the previous calendar month from
    their StreamEvents (spec §2.11.2). Run monthly via cron/Celery beat — never
    on-request.
    """

    help = "Calculate artist payouts for the previous calendar month."

    def handle(self, *args, **options):
        today = timezone.now().date()
        period_month = today.replace(day=1) - timezone.timedelta(days=1)
        period_month = period_month.replace(day=1)
        period_end = today.replace(day=1)

        rate = settings.PAYOUT_RATE_PER_STREAM
        artists = ArtistProfile.objects.filter(verification_status=ArtistProfile.VerificationStatus.APPROVED)

        settled = 0
        for artist in artists:
            events = StreamEvent.objects.filter(
                track__album__artist_profile=artist,
                played_at__gte=period_month,
                played_at__lt=period_end,
            )
            total_streams = events.count()
            if total_streams == 0:
                continue

            unique_listeners = events.values("user").distinct().count()
            Payout.objects.update_or_create(
                artist_profile=artist,
                period_month=period_month,
                defaults={
                    "unique_listeners": unique_listeners,
                    "total_streams": total_streams,
                    "amount": total_streams * rate,
                },
            )
            settled += 1

        self.stdout.write(self.style.SUCCESS(f"Calculated payouts for {settled} artist(s) for {period_month}."))
