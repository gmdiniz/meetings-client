from unicodedata import name
from django.urls import path

from .views import restapi

app_name = 'videoconference'

urlpatterns = [
    path(r'list_meetings', 
        restapi.ListAllMeetings, 
        name="list_meetings"),

    path('<int:meeting_id>/', 
        restapi.DetailedMeeting, 
        name='detailed_list'),
]
