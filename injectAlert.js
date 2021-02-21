// type can be low,medium,high,insane
function createAlertElement(type, text, id) {
    let toxicityInformationDIV = document.createElement("div");
    toxicityInformationDIV.setAttribute("id", id);

    let colorMap = new Map();
    colorMap.set("low", "green");
    colorMap.set("medium", "pink");
    colorMap.set("high", "red");
    colorMap.set("clickbait", "yellow")

    let divClasses = ["p-4", "border-l-4"];

    if (colorMap.has(type)) {
        divClasses.push(
            `bg-${colorMap.get(type)}-100`,
            `border-${colorMap.get(type)}-400`
        );
        toxicityInformationDIV.innerHTML = `
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-${colorMap.get(
            type
        )}-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <p class="text-sm text-${colorMap.get(type)}-700">
          ${text}
        </p>
      </div>
    </div>
  `;
    }

    toxicityInformationDIV.classList.add(...divClasses);

    return toxicityInformationDIV;
}

//
function tweetParser(tweetDom) {
    let tweetContent = tweetDom.innerText;
    let tweet = {
        name: "",
        username: "",
        time: "",
        content: "",
        interaction: {
            reply: "",
            retweets: "",
            like: "",
        },
    };

    let timeElm = tweetDom.getElementsByTagName("time")[0];
    if (timeElm) {
        let timeDis = timeElm.innerText;

        let dateTimeAtri = timeElm.getAttribute("datetime");
        let splitTweet = tweetContent.split(/\n/);
        let splitLength = splitTweet.length;
        let breakpoint = 4;
        let endContent = splitLength - 4;
        for (let i = 0; i < splitLength; i++) {
            if (splitTweet[i] === timeDis) {
                breakpoint = i;
            }
        }

        tweet.name = splitTweet[0];
        tweet.username = splitTweet[1];
        tweet.time = dateTimeAtri;
        tweet.content = splitTweet.slice(breakpoint + 1, endContent + 1);
        tweet.content = tweet.content.join("\n");
        tweet.interaction.reply = splitTweet[endContent + 1];
        tweet.interaction.retweets = splitTweet[endContent + 2];
        tweet.interaction.like = splitTweet[endContent + 3];
        return tweet;
    } // no time
    else return null;
}

function setToxicityInformation(element) {
    let tweetIds = [];
    let divs = element.querySelectorAll('[data-testid="tweet"]'); // Load Div Elements
    let tweets = divs;
    if (tweets.length !== 0) {
        Array.prototype.forEach.call(tweets, function (tweet) {
            tweet_data = tweetParser(tweet);
            if (tweet_data) {
                let commentText = tweet_data.content;
                if (commentText.startsWith("Replying")) {
                    commentText = tweet_data.interaction.reply;
                }

                let body = {text: [commentText]};

                fetch("https://46ed3d4095f5.ngrok.io/model/predict", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        accept: "application/json",
                    },
                    body: JSON.stringify(body),
                })
                    .then((res) => res.json())
                    .then((body) => {
                        if (
                            tweet.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].getAttribute(
                                "id"
                            ) === "toxicity-alert"
                        ) {
                            return;
                        }

                        let maximum = 0;
                        let type = "error";
                        let results = body.results[0].predictions;

                        for (const toxicity_type in results) {
                            if (results[toxicity_type] > maximum) {
                                maximum = results[toxicity_type];
                                type = toxicity_type;
                            }
                        }

                        if (maximum < 0.45) {
                            tweet.parentElement.parentElement.parentElement.parentElement.parentElement.prepend(
                                createAlertElement(
                                    "low",
                                    "The following tweet is safe to read!",
                                    "toxicity-alert"
                                )
                            );
                        } else if (maximum < 0.85) {
                            tweet.parentElement.parentElement.parentElement.parentElement.parentElement.prepend(
                                createAlertElement(
                                    "medium",
                                    "The following tweet may disturb some, as it was identified as being " +
                                    type,
                                    "toxicity-alert"
                                )
                            );
                        } else {
                            tweet.setAttribute("style", "display: none;");

                            let button = document.createElement("button");
                            let buttonClassList = ["bg-blue-500", "text-gray-50"];
                            button.classList.add(...buttonClassList);
                            button.innerHTML = "Show comment";
                            button.classList.add("on");
                            button.addEventListener("click", function () {
                                if (button.classList.contains("on")) {
                                    tweet.removeAttribute("style");
                                    button.innerHTML = "Hide comment";
                                    button.classList.remove("on");
                                    button.classList.add("off");
                                } else {
                                    tweet.setAttribute("style", "display: none;");
                                    button.innerHTML = "Show comment";
                                    button.classList.remove("off");
                                    button.classList.add("on");
                                }

                            });

                            tweet.parentElement.parentElement.parentElement.parentElement.parentElement.prepend(
                                button
                            );

                            tweet.parentElement.parentElement.parentElement.parentElement.parentElement.prepend(
                                createAlertElement(
                                    "high",
                                    "The following tweet may be very disturbing to most, as it was identified as being strongly " +
                                    type,
                                    "toxicity-alert"
                                )
                            );
                        }
                    })
                    .catch((e) =>
                        // Change this to say error
                        console.log(e)
                    );


                // Check if it is fake news
                if (commentText.length > 25) {
                    fetch("https://detoxifier-server.herokuapp.com/post/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            accept: "application/json",
                        },
                        body: JSON.stringify(commentText),
                    }).then((res) => res.json())
                        .then((body) => {
                            if (
                                tweet.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].getAttribute(
                                    "id"
                                ) === "fake-news-alert"
                            ) {
                                return;
                            }

                            if (body["prediction"] === "clickbait and probably fake") {
                                tweet.parentElement.parentElement.parentElement.parentElement.parentElement.prepend(
                                    createAlertElement(
                                        "medium",
                                        "The following tweet is clickbait and contains something that may be fake news. Consider reading a reliable source instead of this tweet. ",
                                        "fake-news-alert")
                                );
                            }
                            if (body["prediction"] === "probably fake") {
                                tweet.parentElement.parentElement.parentElement.parentElement.parentElement.prepend(
                                    createAlertElement(
                                        "medium",
                                        "The following tweet contains something that may be fake news. Consider reading a reliable source instead of this tweet. ",
                                        "fake-news-alert")
                                );
                            }
                            if (body["prediction"] === "clickbait") {
                                tweet.parentElement.parentElement.parentElement.parentElement.parentElement.prepend(
                                    createAlertElement(
                                        "clickbait",
                                        "The following tweet is clickbait.",
                                        "fake-news-alert")
                                );
                            }

                        })
                        .catch((e) =>
                            // Change this to say error
                            console.log(e)
                        );
                }
            }
        });
    }
}

// We set the toxicity information for the whole document
setToxicityInformation(document);

if (document.querySelector('[aria-labelledby^="accessible-list"]')) {
    document
        .querySelector('[aria-labelledby^="accessible-list"]')
        .addEventListener("DOMNodeInserted", function (event) {
            //setToxicityInformationHome(event.target);
            //setToxicityInformationProfile(event.target);
            setToxicityInformation(event.target);
        });
}
