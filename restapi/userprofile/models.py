from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class UsersProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='profile')
    metadata = models.JSONField(default=list, decoder=None, blank=True)
    phone_number = models.CharField(max_length=256, null=False)
