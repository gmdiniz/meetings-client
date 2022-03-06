from django.contrib.auth.models import User
from django.db import models

# Create your models here.
class Meeting(models.Model):
    meeting_id = models.IntegerField(null=False, primary_key=True),
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=False),
    title = models.CharField(max_length=256, null=False),
    start_date = models.DateField(null=False),
    end_date = models.DateField(null=True),
    creation = models.DateField(auto_now_add=False),
    active = models.BooleanField(null=False),
    moderators = models.JSONField(),
    metadata = models.JSONField(),
    permissions = models.JSONField()
