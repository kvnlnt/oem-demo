function init(){
  function onDrawerClose(){ oem.read('hamburger').toggle(); }
  oem.events.addEventListener(oem.read('menuDrawer').getEvents().closed, onDrawerClose);
}

oem.events.addEventListener(oem.EVENTS.COMPONENTS_INITIALIZED, init);