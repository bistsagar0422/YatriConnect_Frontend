from django.shortcuts import render
from django.http import HttpResponse


# Create your views here.
def display(request):
    return HttpResponse("Hello this is from Sensor Data")