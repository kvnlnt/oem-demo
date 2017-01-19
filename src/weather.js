var Main = {
    controller: function() {

        var self = this;

        // Props

        self.key = "572413c05e0144bde1ec6ac48e964a7e";
        self.weather = m.prop([]);
        self.city = m.prop("Bellingham");
        self.zip = m.prop(98226);

        // Funcs
        
        self.changeZip = function(e){
            var zip = e.target.dataset.zip;
            oem.read('menuDrawer').close();
            self.getWeather(zip);
        };

        self.groupDays = function(list) {
            var groupings = [];
            var currDate = null;
            var currGroup = -1;
            for (var i = 0; i < list.length; i++) {
                if (currDate != list[i].dt_txt.split(' ')[0]) {
                    currGroup += 1;
                    groupings.push([]);
                }
                groupings[currGroup].push(list[i]);
                currDate = list[i].dt_txt.split(' ')[0];
            }
            return groupings;
        };

        self.getWeather = function(zip) {
            var feedUrl = "http://api.openweathermap.org/data/2.5/forecast/city?zip=" + zip + ",us&appid=" + self.key + "&units=imperial";
            m.request({ method: "GET", url: feedUrl }).then(function(res){
                self.weather(res)
                self.city(res.city.name);
                self.zip(zip);
            });
        };

        self.onHamburgerClick = function(argument) { oem.read('menuDrawer').toggle(); };
        self.onDrawerClose = function(argument) { oem.read('hamburger').deactivate(); }
        self.onWeatherFormSubmit = function(e) {  self.getWeather(e.data.zipCode); };

        self.updateClock = function() {
            var now = moment(),
                second = now.seconds() * 6,
                minute = now.minutes() * 6 + second / 60,
                hour = ((now.hours() % 12) / 12) * 360 + 90 + minute / 12;
            document.getElementById('hour').style.transform = "rotate(" + hour.toFixed(1) + "deg)";
            document.getElementById('minute').style.transform = "rotate(" + minute + "deg)";
            document.getElementById('second').style.transform = "rotate(" + second + "deg)";
        };

        self.timedUpdate = function() {
            self.updateClock();
            setTimeout(self.timedUpdate, 1000);
        };

        self.startClock = function(argument) {
            self.timedUpdate();
        };

        self.iconList = {
            '01d':'wi-day-sunny',
            '02d':'wi-day-cloudy',
            '03d':'wi-cloud',
            '04d':'wi-cloudy',
            '09d':'wi-rain',
            '10d':'wi-day-rain',
            '11d':'wi-thunderstorm',
            '13d':'wi-snow',
            '50d':'wi-fog',
            '01n':'wi-night-clear',
            '02n':'wi-night-cloudy',
            '03n':'wi-cloud',
            '04n':'wi-cloudy',
            '09n':'wi-rain',
            '10n':'wi-night-rain',
            '11n':'wi-thunderstorm',
            '13n':'wi-snow',
            '50n':'wi-fog'
        };

        // Events

        oem.events.addEventListener(oem.EVENTS.COMPONENTS_INITIALIZED, function() {
            oem.read("hamburger").getEl().addEventListener("click", self.onHamburgerClick);
            oem.events.addEventListener(oem.read("menuDrawer").getEvents().closed, self.onDrawerClose);
            oem.events.addEventListener(oem.read("weatherForm").getEvents().submitted, self.onWeatherFormSubmit);
            self.getWeather(98226);
        });

    },
    view: function(ctrl) {

        function formatDate(dateString) {
            var arrayifyString = dateString.split(' ')[0].split('-');
            var date = arrayifyString[1] + '/' + arrayifyString[2];
            return date;
        }

        function formatTime(dateString) {
            var arrayifyString = dateString.split(' ')[1].split(':');
            var hour = arrayifyString[0];
            var meridiem = hour >= 12 ? "pm" : "am";
            var twelveHourClock = (hour > 12 ? hour - 12 : hour);
            var removeLeadingZeros = twelveHourClock.toString().replace(/^0+/, '');
            var fixMidnight = removeLeadingZeros.length ? removeLeadingZeros : 12;
            return fixMidnight + meridiem;
        }

        function getDayReport(day) {
            return m("div", { class: "weather-list__item" },
                m('h3', formatDate(day[0].dt_txt) + " "),
                day.map(function(report) {
                    // var summary = m("span", formatTime(report.dt_txt) + "  " +
                    //     report.weather[0].description + " " +
                    //     m.trust(Math.round(report.main.temp) + "&deg; ") +
                    //     report.main.humidity + "% hum " +
                    //     Math.round(report.wind.speed) + "mph");
                    var temp = m("span", {"class": "weather-list__temp"}, m.trust(Math.round(report.main.temp) + "&deg; "));
                    var time = m("span", {"class": "weather-list__time"}, '@'+formatTime(report.dt_txt));
                    var icon = m("i", {"class":"wi "+ctrl.iconList[report.weather[0].icon]});
                    return m("span", [ icon, temp, time]);
                }));
        }

        function getReports() {
            if (!ctrl.weather().hasOwnProperty('list')) return null;
            return ctrl.groupDays(ctrl.weather().list).map(getDayReport);
        }

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
            m("div", { "class": "clock-circle", "config": ctrl.startClock }, [
                m("div", { "class": "clock-face" }, [
                    m("div", { "id": "hour", "class": "clock-hour" }),
                    m("div", { "id": "minute", "class": "clock-minute" }),
                    m("div", { "id": "second", "class": "clock-second" }),
                ])
            ]),
            m("div", {
                "id": "menuDrawer",
                "data-oem": "Drawer",
                "data-oem-id": "menuDrawer",
                "data-oem-full-screen-at": 450,
                "data-oem-close-button-mode": "ONLY_FULLSCREEN"
            }, [
                m("a", { "class": "location-link", "data-zip": "98101", "onclick":ctrl.changeZip }, "Seattle"),
                m("a", { "class": "location-link", "data-zip": "10014", "onclick":ctrl.changeZip }, "New York"),
                m("a", { "class": "location-link", "data-zip": "90013", "onclick":ctrl.changeZip }, "Los Angeles"),
                m("a", { "class": "location-link", "data-zip": "60604", "onclick":ctrl.changeZip }, "Chicago"),
                m("a", { "class": "location-link", "data-zip": "77001", "onclick":ctrl.changeZip }, "Houston")
            ]),
            m("div", {
                "data-oem": "Responsifier",
                "data-oem-id": "responsifyMenuDrawer",
                "data-oem-component": "demo",
                "data-oem-responsive-class": "--desktop",
                "data-oem-dimension": "width",
                "data-oem-min": 600,
                "data-oem-max": "*"
            }),
            m("div", {
                "id": "weatherForm",
                "data-oem": "Form",
                "data-oem-id": "weatherForm"
            }, [
                m("fieldset", [
                    m("div", {
                        "data-oem": "TextInput",
                        "data-oem-id": "zipCode",
                        "data-oem-form": "weatherForm",
                        "data-oem-mask": "XXXXX"
                    }, [
                        m("label", { "for": "zipCode" }, "Weather"),
                        m("div", { "class": "help" }, "Enter your zip code to get the latest weather."),
                        m("input", {
                            "type": "text",
                            "name": "zipCode",
                            "placeholder": "98226",
                            "value": ctrl.zip()
                        })
                    ]),
                    m("div", {
                        "data-oem": "Validator",
                        "data-oem-id": "validateZipCode",
                        "data-oem-field": "zipCode",
                        "data-oem-validation": "required"
                    }, "You must enter a valid zipcode")
                ]),
                m("fieldset", [
                    m("button", {
                        "data-oem": "SubmitButton",
                        "data-oem-id": "submitWeatherForm",
                        "data-oem-form": "weatherForm",
                        "data-oem-class": "Button",
                        "class": "--hollow",
                        "type": "submit"
                    }, "Go"),
                    m("button", {
                        "data-oem": "Button",
                        "data-oem-id": "resetWeatherForm",
                        "data-oem-class": "Button",
                        "class": "--hollow",
                        "type": "reset"
                    }, "reset")
                ])
            ]),
            m("h2", ctrl.city()),
            m("div", { class: "weather-list" }, getReports())
        ];

    }
};

m.mount(document.getElementById("demo"), Main);