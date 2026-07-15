from django.contrib import admin

from apps.playlists.models import Playlist, PlaylistTrack

admin.site.register(Playlist)
admin.site.register(PlaylistTrack)
