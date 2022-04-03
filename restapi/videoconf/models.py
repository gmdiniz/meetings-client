from django.contrib.auth.models import User
from django.db import models
from uuid import uuid4

# Create your models here.
class Meeting(models.Model):
    meeting_id = models.UUIDField(
        primary_key=True, default=uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
    title = models.CharField(max_length=256, null=False)
    start_date = models.DateField(null=False)
    end_date = models.DateField(null=True, blank=True)
    creation = models.DateField(auto_now_add=True)
    active = models.BooleanField(null=False, default=True)
    participants = models.JSONField(default=list, decoder=None, blank=True)
    moderators = models.JSONField(default=list, decoder=None, blank=True)
    metadata = models.JSONField(default=list, decoder=None, blank=True)
    permissions = models.JSONField(default=list, decoder=None, blank=True)


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    metadata = models.JSONField(default=list, decoder=None, blank=True)
    phone_number = models.CharField(max_length=256, null=False)
