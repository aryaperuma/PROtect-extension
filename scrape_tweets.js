function scrapeTweets() {
    var root = document.querySelector('[aria-label="Timeline: Your Home Timeline"]')
    if (!root) {
        // The node we need does not exist yet.
        // Wait 500ms and try again
        window.setTimeout(scrapeTweets, 500);
        return;
    }

    let divs = document.querySelectorAll("div") // Load Div Elements
    let tweets = []
    for(let div of divs) {
        let dataTestId = div.getAttribute("data-testid")
        if(dataTestId == "tweet")
            {
            tweets.push(div)
            }
    } // Load Tweet Elements by checking for specific Attribute
    console.log(tweets)

    for(let tweet of tweets){
        let aTags = tweet.getElementsByTagName("a")
        // Gets all the <a> tags from the tweet element
        for(let aTag of aTags){
            let href = aTag.getAttribute("href")
        // Gets the value of the href attribute
            if(href.includes("/status/")){
                let tweetId = href.split("/status/") 
                // Splits the string into a list
                tweetId = tweetId[1]
                console.log(tweetId)
                break; // Just getting the first of these URLs}
            }
        }
    }
}


scrapeTweets();