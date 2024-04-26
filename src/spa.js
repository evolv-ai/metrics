export function instrumentSpaEvent(tag) {
  window.history.pushState = ((f) =>
    function pushState() {
      var url = window.location.href;
      var ret = f.apply(this, arguments);

      if (url != window.location.href) {
        window.dispatchEvent(new Event(tag));
      }
      return ret;
    })(window.history.pushState);

  window.history.replaceState = ((f) =>
    function replaceState() {
      var url = window.location.href;
      var ret = f.apply(this, arguments);

      if (url != window.location.href) {
        window.dispatchEvent(new Event(tag));
      }
      return ret;
    })(window.history.replaceState);

  window.addEventListener("popstate", () => {
    window.dispatchEvent(new Event(tag));
  });
}
