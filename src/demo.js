var component = {
    controller: function() {
        var self = this;
        self.onHamburgerClick = function(argument) { oem.read('menuDrawer').toggle(); };
        self.onDrawerClose = function (argument) { oem.read('hamburger').deactivate(); }
        oem.events.addEventListener(oem.EVENTS.COMPONENTS_INITIALIZED, function(){
            oem.read("hamburger").getEl().addEventListener("click", self.onHamburgerClick);
            oem.events.addEventListener(oem.read("menuDrawer").getEvents().closed, self.onDrawerClose);
        });

        /**
         * Clock
         */
        function updateClock(){
            var now = moment(),
                second = now.seconds() * 6,
                minute = now.minutes() * 6 + second / 60,
                hour = ((now.hours() % 12) / 12) * 360 + 90 + minute / 12;
            document.getElementById('hour').style.transform = "rotate(" + hour.toFixed(1) + "deg)";
            document.getElementById('minute').style.transform = "rotate(" + minute + "deg)";
            document.getElementById('second').style.transform = "rotate(" + second + "deg)";
        }

        function timedUpdate () {
            updateClock();
            setTimeout(timedUpdate, 1000);
        }
      
        this.startClock = function (argument) {
            timedUpdate();
        }
    },
    view: function(ctrl) {

        return [
            m("h1", {}, moment().format('dddd')),
            m("p", { "class": "tagline" }, moment().format('MMMM Do, YYYY')),
            m("button", {
                    "id": "hamburger",
                    "data-oem": "Hamburger",
                    "data-oem-id": "hamburger"
                },
                m("span", {}, "toggle menu")
            ),
            m("div", {"class":"clock-circle", "config": ctrl.startClock}, [
                m("div", {"class":"clock-face"}, [
                    m("div", {"id":"hour", "class": "clock-hour"}),
                    m("div", {"id":"minute", "class": "clock-minute"}),
                    m("div", {"id":"second", "class": "clock-second"}),
                ])
            ]),
            m("div", {
                "id": "menuDrawer",
                "data-oem": "Drawer",
                "data-oem-id": "menuDrawer",
                "data-oem-full-screen-at": 450,
                "data-oem-close-button-mode": "ONLY_FULLSCREEN"
            }, [
                m("i", {"class":"fa fa-facebook-square", "aria-hidden":"true"}),
                m("i", {"class":"fa fa-linkedin-square", "aria-hidden":"true"}),
                m("i", {"class":"fa fa-twitter-square", "aria-hidden":"true"}),
                m("i", {"class":"fa fa-instagram", "aria-hidden":"true"}),
                m("i", {"class":"fa fa-snapchat-square", "aria-hidden":"true"})
            ]),
            m("div", {
                "data-oem": "Responsifier",
                "data-oem-id": "responsifyMenuDrawer",
                "data-oem-component": "demo",
                "data-oem-responsive-class":"--desktop",
                "data-oem-dimension":"width",
                "data-oem-min":600,
                "data-oem-max":"*"
            }),
            m("div", {
                "id":"weatherForm",
                "data-oem":"Form",
                "data-oem-id":"weatherForm"
            }, [
                m("fieldset", [
                    m("div", {
                        "data-oem":"TextInput",
                        "data-oem-id":"zipCode",
                        "data-oem-form":"weatherForm",
                        "data-oem-mask":"XXXXX"
                    }, [
                        m("label", { "for":"zipCode" }, "Weather"),
                        m("div", {"class":"help"}, "Enter your zip code to get the latest weather."),
                        m("input", { 
                            "type":"text", 
                            "name":"zipCode", 
                            "placeholder":"98226",
                            "value":""
                        })
                    ]),
                    m("div", {
                        "data-oem":"Validator",
                        "data-oem-id":"validateZipCode",
                        "data-oem-field":"zipCode",
                        "data-oem-validation":"required"
                    }, "You must enter a valid zipcode")
                ]),
                m("fieldset", [
                    m("button", {
                        "data-oem":"SubmitButton",
                        "data-oem-id":"submitWeatherForm",
                        "data-oem-form":"weatherForm",
                        "data-oem-class":"Button",
                        "type":"submit"
                    }, "Go"),
                    m("button", {
                        "data-oem":"Button",
                        "data-oem-id":"resetWeatherForm",
                        "class":"--hollow",
                        "type":"reset"
                    }, "reset")
                ])
            ])
        ];

    }
};

m.mount(document.getElementById("demo"), component);