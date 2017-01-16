function init(){

    var components = {
        hamburger: oem.read('hamburger'),
        menuDrawer: oem.read("menuDrawer")
    };

    function onDrawerClose(){ 
        components.hamburger.deactivate();
    }

    function onHamburgerClick(){
        components.menuDrawer.toggle();
    }


  oem.events.addEventListener(components.menuDrawer.getEvents().closed, onDrawerClose);
  components.hamburger.getEl().addEventListener("click", onHamburgerClick);
}

oem.events.addEventListener(oem.EVENTS.COMPONENTS_INITIALIZED, init);