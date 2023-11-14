
export function instrumentSpaEvent(tag){

    window.history.pushState = (f => function pushState() {
        var ret = f.apply(this, arguments);
        window.dispatchEvent(new Event(tag));
        return ret;
    })(window.history.pushState);

    window.history.replaceState = (f => function replaceState() {
        var ret = f.apply(this, arguments);
        window.dispatchEvent(new Event(tag));
        return ret;
    })(window.history.replaceState);

    window.addEventListener('popstate', () => {
        window.dispatchEvent(new Event(tag));
    });
}