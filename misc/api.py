import sys
import requests

def run():
    if len(sys.argv) != 2:
        return

    arg = sys.argv[1];

    url = "http://localhost:3000/"
    method = "post"
    json = {
        "email": "zalupa@gmail.com",
        "username": "smokingplaya",
        "password": "asdasdasd",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJzbW9raW5ncGxheWEiLCJleHAiOjE3MTQ2MDQ4MTUsIm5iZiI6MTcxNDU2MTYxNX0=.b09ad8f28dd4efa4201500cf00996fc947a87624fd431595806af0e1cd3d07ee"
    };

    match arg:
        case "register":
            method = "post"
            url += "user/register"
        case "login":
            method = "post"
            url += "user/login"
            json["get-token"] = "xd"
        case "banadd":
            url += "bans/add"
            json["user"] = 1
            json["reason"] = "гандон"
            json["unban_time"] = 60
        case "products":
            url += "products/get"
            method = "get"
        case "discord":
            url += "discord/report"
            method = "post"
            json["msg"] = "Привет, это мое тестовое сообщение!"
        case _:
            print("unknown arg \"" + arg + "\"")

    response = getattr(requests, method)(url, json=json)

    print("[HTTP/" + str(response.status_code) + "] " + response.text)

if __name__ == "__main__":
    run()