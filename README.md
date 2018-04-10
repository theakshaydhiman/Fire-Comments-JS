# Fire Comments JS
Commenting system for static websites using Firebase Realtime Database.

## Demo

[Fire Comments JS Demo](https://theakshaydhiman.github.io/fire-comments/).

## Features

Fire Comments JS is a server-less, PHP-less, SQL-less and Disqus-less way to add a commenting system to your static web pages. Some notable features are:

* The biggest feature is the ability to reply to existing comments.
* Uses Gravatar to show profile pictures.
* Counts the number of comments.
* Converts links to `rel="nofollow"` and adds `target="_blank" rel="noopener"` automatically.
* Prevents harmful XSS code to be rendered.
* You have full control over your data. Unlike any 3rd-party company such as Disqus.

**Disclaimer:** This code has bugs. I'd love to hear suggestions/fixes. More features (Markdown, email notifications) will be added soon.

## Getting Started
Use this markup in your `.html` file:
```html
<div class="comments">

    <!-- Title, with comment count -->
    <h2><span id="comments-count"></span> Comments</h2>

    <!-- Display comments here -->
    <ul id="comments-list"></ul>
  
    <!-- Reference to return comment form after this span, when the reply form is cancelled -->
    <span id="comment-container"></span>

    <!-- Comment form -->
    <form id="comment" style="display:block;">
      <h3 id="comment-form-title">Leave a comment</h3>
      <textarea id="message" type="text" placeholder="Comment (HTML supported)" required></textarea>
      <input id="name" type="text" placeholder="Name" required>
      <input id="email" type="email" placeholder="Email" required>
      <button class="btn" type="submit" name="action">Post Comment</button>
    </form>

    <!-- Reply form -->
    <form id="reply" style="display:none;">
      <h3 id="reply-form-title"></h3>
      <div id="cancel-reply"><a href="#!" class="cancel-reply-link">Cancel Reply</a></div>
      <textarea id="message" type="text" placeholder="Comment (HTML supported)" required></textarea>
      <input id="name" type="text" placeholder="Name" required>
      <input id="email" type="email" placeholder="Email" required>
      <button class="btn" type="submit" name="action">Post Comment</button>
    </form>

</div>
```

## Dependencies

Fire Comments JS has four dependencies. Feel free to use their CDN links if you want.
1. [MD5](https://github.com/blueimp/JavaScript-MD5) converts the email strings to [MD5](https://en.wikipedia.org/wiki/MD5) hash, which is later used to display Gravatar profile pictures.
1. Comment submission time is stored in Firebase using `firebase.database.ServerValue.TIMESTAMP` in the Unix format. [Timeago](https://github.com/hustcc/timeago.js) converts the Unix format into human readable format.
1. [XSS-Filters](https://github.com/yahoo/xss-filters) is used to prevent harmful XSS attacks. For now, XSS code can be submitted to the database, but will later be filtered when rendered.
1. [Firebase](https://firebase.google.com). Of course.

**IMPORTANT**: Use your own Firebase credentials. Create a new Firebase project if you haven't yet, go to your project overview and click "Add Firebase to your web app." Paste the code here.
```html
<script src="js/md5.js"></script>
<script src="js/timeago.js"></script>
<script src="js/xss-filters.js"></script>
<!-- Paste your Firebase code here !>
```
Download the **`fire-comments.min.js` [from here](https://github.com/theakshaydhiman/Fire-Comments-JS/releases/download/0.3.0/fire-comments.min.js)** and include this in the end.
```html
<script src="fire-comments.min.js"></script>
```
## Configure Firebase Realtime Database Rules
Submitting the comments will show a "Permissions denied" error because the default rules of Realtime Databse are restricted to Auth only. **For testing purposes only**, set the `.read` and `.write` rules to `true`.
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
Once you're done testing, you must change the `.write` permissions to `false` and add a `$slug` rule to allow comment submissions.
```json
{
  "rules": {
    ".read": true,
    ".write": false,
    "$slug": {
          ".write": "!data.exists()",
          "$message": {
            ".write": "!data.exists() && newData.exists()"
          }
        }
  }
}
```

## Testing
Submit some comments and check your Firebase Realtime Database path.
It should look something like this `[project-name]/comments/[path]/[key]`

## License

Fire Comments JS is licensed under the [MIT license](https://github.com/theakshaydhiman/Fire-Comments-JS/blob/master/LICENSE).
