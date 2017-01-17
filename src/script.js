var component = {
    controller: function() {
        var self = this;
        self.onHamburgerClick = function(argument) { oem.read('menuDrawer').toggle(); };
        self.onDrawerClose = function (argument) { oem.read('hamburger').deactivate(); }
        oem.events.addEventListener(oem.EVENTS.COMPONENTS_INITIALIZED, function(){
            oem.read("hamburger").getEl().addEventListener("click", self.onHamburgerClick);
            oem.events.addEventListener(oem.read("menuDrawer").getEvents().closed, self.onDrawerClose);
        });
    },
    view: function(ctrl) {

        return [
            m("h1", {}, "Genesis Haus"),
            m("p", { "class": "tagline" }, "Dirt Don't Hurt"),
            m("button", {
                    "id": "hamburger",
                    "data-oem": "Hamburger",
                    "data-oem-id": "hamburger"
                },
                m("span", {}, "toggle menu")
            ),
            m("div", {
                "id": "menuDrawer",
                "data-oem": "Drawer",
                "data-oem-id": "menuDrawer",
                "data-oem-full-screen-at": 600,
                "data-oem-close-button-mode": "ONLY_FULLSCREEN"
            })
        ];

    }
};

m.mount(document.getElementById("demo"), component);