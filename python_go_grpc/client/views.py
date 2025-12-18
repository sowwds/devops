import logging
from django.shortcuts import render
from django.http import HttpResponse

from client.api.client import Certs
from client.api.client import Client

logger = logging.getLogger(__name__)

# Game Die
#  dices can be shown in text using the range U+2680 to U+2685
ICONS = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"]

def index(request):
    grpc_addr = "127.0.0.1:8443"
    nginx_addr = "127.0.0.1:9445"
    value_a, value_b = 0, 0
    if request.method == "POST":
        crt = Certs('certs/ca.pem', 'certs/client.pem', 'certs/client-key.pem')
        
        try:
            value_a = Client(grpc_addr, crt).roll_die()
        except Exception as e:
            logger.exception(e)

        try:
            value_b = Client(nginx_addr, crt).roll_die()
        except Exception as e:
            logger.exception(e)
            
    ctx = {
        "icon_a": ICONS[value_a],
        "icon_b": ICONS[value_b],
        "sign": "=" if value_a == value_b else "<" if value_a < value_b else ">",
    }
    return render(request, "index.html", context=ctx)


def grpc(request):
    grpc_addr = "127.0.0.1:8443"
    crt = Certs('certs/ca.pem', 'certs/client.pem', 'certs/client-key.pem')
    value = 0
    try:
        value = Client(grpc_addr, crt).roll_die()
    except Exception as e:
        logger.exception(e)

    return HttpResponse('Value: ' + ICONS[value])


def nginx(request):
    nginx_addr = "127.0.0.1:9445"
    crt = Certs('certs/ca.pem', 'certs/client.pem', 'certs/client-key.pem')
    value = 0
    try:
        value = Client(nginx_addr, crt).roll_die()
    except Exception as e:
        logger.exception(e)

    return HttpResponse('Value: ' + ICONS[value])
