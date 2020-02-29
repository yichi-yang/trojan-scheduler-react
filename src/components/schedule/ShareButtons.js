import React from "react";

const ShareButtons = props => {
  let { title, link, description } = props;
  return (
    <ul className="share-buttons">
      <li>
        <a
          href={encodeURI(
            `https://www.facebook.com/sharer/sharer.php?u=${link}&quote=${title}`
          )}
          title="Share on Facebook"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img alt="Share on Facebook" src="/color/Facebook.png" />
        </a>
      </li>
      <li>
        <a
          href={encodeURI(
            `https://twitter.com/intent/tweet?source=${link}&text=${title}: ${link}`
          )}
          target="_blank"
          title="Tweet"
          rel="noopener noreferrer"
        >
          <img alt="Tweet" src="/color/Twitter.png" />
        </a>
      </li>
      <li>
        <a
          href={encodeURI(`https://plus.google.com/share?url=${link}`)}
          target="_blank"
          title="Share on Google+"
          rel="noopener noreferrer"
        >
          <img alt="Share on Google+" src="/color/Google+.png" />
        </a>
      </li>
      <li>
        <a
          href={encodeURI(
            `http://www.reddit.com/submit?url=${link}&title=${title}`
          )}
          target="_blank"
          title="Submit to Reddit"
          rel="noopener noreferrer"
        >
          <img alt="Submit to Reddit" src="/color/Reddit.png" />
        </a>
      </li>
      <li>
        <a
          href={encodeURI(
            `mailto:?subject=${title}&body=${description}: ${link}`
          )}
          target="_blank"
          title="Send email"
          rel="noopener noreferrer"
        >
          <img alt="Send email" src="/color/Email.png" />
        </a>
      </li>
    </ul>
  );
};

export default ShareButtons;
