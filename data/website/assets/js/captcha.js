/*
    Austrum Captcha Lib
            (Zeta Product)
            coded by smokingplaya<3
*/

captcha = {};
captcha.clientToken = "6LccxlIpAAAAAEUW1I1zYY8fPGjPLimTkWQDNn4W";

LOGIN = "/user/login";
REGISTER = "/user/register";
RECOVERY = "/user/recovery";
PASSUPDATE = "/user/passwordupdate";

if (typeof (grecaptcha) === "undefined") {
    let gcaptcha = document.createElement('script');
    gcaptcha.src = "https://www.google.com/recaptcha/api.js?render=" + captcha.clientToken;

    let gcaptcha_h = document.getElementsByTagName('script')[0];
    gcaptcha_h.parentNode.insertBefore(gcaptcha, gcaptcha_h);
}

captcha.overrideClick = (event, url) => {
    event.preventDefault();

    grecaptcha.ready(function () {
        grecaptcha.execute(captcha.clientToken, { action: 'submit' })
            .then(function (token) {
                let body = {
                    "g-recaptcha-response": token
                };

                const login = document.getElementById("login");
                const password = document.getElementById("password");
                /* register/recovery */
                const passwordRepeat = document.getElementById("passwordRepeat");
                const email = document.getElementById("email");

                switch (url) {
                    case LOGIN:
                        if (!login || !password)
                            return;

                        body["username"] = document.getElementById("login").value;
                        body["password"] = document.getElementById("password").value;
                        body["remember"] = document.getElementById("remember").checked;

                        break;
                    case REGISTER:
                        if (!password || !passwordRepeat)
                            return;

                        if (password.value != passwordRepeat.value)
                            return alert("Введенные пароли не совпадают");

                        let agree = document.getElementById("agree");

                        if (!agree || !agree.checked)
                            return alert("Вы должны быть согласны с правилами сервиса");

                        body["email"] = email.value;
                        body["username"] = login.value;
                        body["password"] = password.value;

                        break;
                    case RECOVERY:
                        body["email"] = email.value;

                        break;
                    case PASSUPDATE:
                        if (!password || !passwordRepeat)
                            return;

                        if (password.value != passwordRepeat.value)
                            return alert("Введенные пароли не совпадают");

                        body["new_password"] = password.value;

                        break;
                }

                return fetch(url, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });
            })
            .then(res => {
                if (res.redirected)
                    document.location = res.url;

                return typeof res == "object" ? res.json() : {};
            })
            .then(data => { if (data.msg) alert(data.msg); });
    }
    );
};