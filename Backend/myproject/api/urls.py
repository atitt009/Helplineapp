from django.urls import path
from .views import ChatView
from .views import FAQList

urlpatterns = [
    path('chat/', ChatView.as_view(), name='chat'),
    path('faq/', FAQList.as_view(), name='faq'),
    path('faq/categories/', FAQList.as_view(), name='faq_categories')
]