from django.contrib import admin

from .models import Conversation, Message, FAQ
# Register your models here.

# importing to see in the admin panel
admin.site.register(Conversation)
admin.site.register(Message)
admin.site.register(FAQ)