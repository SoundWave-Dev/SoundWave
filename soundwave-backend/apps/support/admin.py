from django.contrib import admin

from apps.support.models import Ticket, TicketMessage

admin.site.register(Ticket)
admin.site.register(TicketMessage)
