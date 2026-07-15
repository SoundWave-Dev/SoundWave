from django.contrib import admin

from apps.music.models import Album, StreamEvent, Track

admin.site.register(Album)
admin.site.register(Track)
admin.site.register(StreamEvent)
