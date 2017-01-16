function onDrawerClose(){ 
    oem.read('hamburger').deactivate();
    // var hamburger = oem.read('hamburger');
    // var drawer = oem.read('menuDrawer');
    // if(drawer.isFullScreen() && hamburger.isActive()) oem.read('hamburger').deactivate(); 
}

function init(){
  oem.events.addEventListener(oem.read('menuDrawer').getEvents().closed, onDrawerClose);
}

oem.events.addEventListener(oem.EVENTS.COMPONENTS_INITIALIZED, init);