console.log("**** mp_snippet");

mixpanel.identify("12148");
mixpanel.people.set({
    "$email": "jsmith@example.com",    // only special properties need the $
    "$created": "2011-03-16 16:53:54",
    "$last_login": new Date(),         // properties can be dates...
    "credits": 150,                    // ...or numbers
    "gender": "Male"                    // feel free to define your own properties
});