var component = {
    controller: function() {
        // var self = this;
        // self.onHamburgerClick = function(argument) { oem.read('menuDrawer').toggle(); };
        // self.onDrawerClose = function (argument) { oem.read('hamburger').deactivate(); }
        // oem.events.addEventListener(oem.EVENTS.COMPONENTS_INITIALIZED, function(){
        //     oem.read("hamburger").getEl().addEventListener("click", self.onHamburgerClick);
        //     oem.events.addEventListener(oem.read("menuDrawer").getEvents().closed, self.onDrawerClose);
        // });
    },
    view: function(ctrl) {

        var header = m("div", {"id":"header"}, "Header");
        var leftNav = m("div", {"id":"leftNav"}, [
            m("div", {"class":"item"}, [
                m("span", "Pages"),
                m("i", {"class":"fa fa-file"})
            ]),
            m("div", {"class":"item"}, [
                m("span", "Assets"),
                m("i", {"class":"fa fa-paperclip"})
            ]),
            m("div", {"class":"item"}, [
                m("span", "Comments"),
                m("i", {"class":"fa fa-comment"})
            ]),
            m("div", {"class":"item"}, [
                m("span", "Settings"),
                m("i", {"class":"fa fa-cog"})
            ]),
            m("div", {"class":"item"}, [
                m("span", "Maps"),
                m("i", {"class":"fa fa-map"})
            ]),
            m("div", {"class":"item"}, [
                m("span", "Trash"),
                m("i", {"class":"fa fa-trash"})
            ])
        ]);

        var responsifyLeftNav = m("div", {
            "data-oem":"Responsifier",
            "data-oem-id":"responsifierExample",
            "data-oem-component":"leftNav",
            "data-oem-container":"demo",
            "data-oem-responsive-class":"--slim",
            "data-oem-dimension":"width",
            "data-oem-min":"0",
            "data-oem-max":"360"
        });
        
        var main = m("div", {"id":"main"}, "Main");

        return [leftNav, responsifyLeftNav, main];

    }
};

m.mount(document.getElementById("demo"), component);