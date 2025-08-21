from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User

class Conversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Conversation with {self.user.username} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    text = models.TextField()
    is_user = models.BooleanField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{'User' if self.is_user else 'Bot'}: {self.text[:50]}..."
    
class FAQ(models.Model):
    """
    Stores frequently asked questions and their corresponding answers.
    """
    question = models.TextField()
    answer = models.TextField()

    def __str__(self):
        return self.question[:50]

class FAQ(models.Model):
    """
    Stores frequently asked questions and their corresponding answers.
    """
    question = models.TextField()
    answer = models.TextField()
    category = models.TextField(default='General')
    def __str__(self):
        return self.question[:50]
