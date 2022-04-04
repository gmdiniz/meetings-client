from django.http import JsonResponse

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from ..models import Meeting


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ListAllMeetings(request):
    meetings = Meeting.objects.all()
    meetings = list(meetings.values())
    return JsonResponse(meetings, safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def DetailedMeeting(request, meeting_id):
    meeting = Meeting.objects.filter(meeting_id=meeting_id)
    meeting = list(meeting.values())
    return JsonResponse(meeting, safe=False)
