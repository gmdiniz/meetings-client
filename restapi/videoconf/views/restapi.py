from django.http import HttpResponse, JsonResponse
import json


def ListAllMeetings(request):
    return HttpResponse('Listing all meetings')


def DetailedMeeting(request, meeting_id):
    return HttpResponse('Detailed meeting')