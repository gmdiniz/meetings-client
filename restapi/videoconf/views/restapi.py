from django.http import HttpResponse, JsonResponse
from django.core import serializers
from ..models import Meeting
import json


def ListAllMeetings(request):
    meetings = Meeting.objects.all()
    meetings = list(meetings.values())
    return JsonResponse(meetings, safe=False)


def DetailedMeeting(request, meeting_id):
    meeting = Meeting.objects.filter(meeting_id=meeting_id)
    meeting = list(meeting.values())
    return JsonResponse(meeting, safe=False)
