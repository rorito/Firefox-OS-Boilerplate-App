function yourMixpanelEvents() {
    console.log("**** mp_snippet");

    mixpanel.identify("12148");
    mixpanel.people.set({
        "$email": "rp@petty.com",           // only special properties need the $
        "$created": "2014-12-03 14:25:54",
        "$last_login": new Date(),          // properties can be dates...
        "credits": 150,                     // ...or numbers
        "gender": "Male"                    // feel free to define your own properties
    });

    mixpanel.track("Video played", {"user": "fred"});

    alert("Sent events to MixPanel!");
}

var clickMixPanel = document.querySelector("#mixpanel-button");
if (clickMixPanel) {
    clickMixPanel.onclick = function () {
        yourMixpanelEvents();
    };
}
