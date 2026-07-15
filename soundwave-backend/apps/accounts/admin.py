from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from apps.accounts.models import ArtistProfile, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    ordering = ["email"]
    list_display = ["email", "username", "role", "is_staff"]
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("SoundWave profile", {"fields": ("role", "display_name", "date_of_birth", "gender", "avatar")}),
    )


@admin.register(ArtistProfile)
class ArtistProfileAdmin(admin.ModelAdmin):
    list_display = ["stage_name", "user", "verification_status", "created_at"]
    list_filter = ["verification_status"]
