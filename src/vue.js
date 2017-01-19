Vue.component('top', Vue.extend({
    template: "#top",
}));

Vue.component('nest', Vue.extend({
    template: '#nest',
    components: {
        view1: Vue.extend({
            template: '<span>this is subview 1</span>',
        }),
        view2: Vue.extend({
            template: '<span>this is subview 2</span>',
        }),
    },
    data: {
        subview: "view1",
    },
}));

var main = new Vue({
    el: "#main",
    data: {
        currentView: "top",
    },
});

var router = new Router({
    '/':        function() { main.currentView = 'top' },
    '/nest/:view': function(view) {
        main.currentView = 'nest';
        main.$.view.subview = view;
    },
});
router.init();