/* 
* Fire Comments JS v0.3.1 (https://github.com/theakshaydhiman/Fire-Comments-JS)
* Copyright 2018 Akshay Dhiman
* MIT License (https://github.com/theakshaydhiman/Fire-Comments-JS/blob/master/LICENSE)
*/

( () => {

  "use strict";

  class Globals {
    constructor() {

      // DOM variables.
      this.comment = this.id('comment');
      this.reply = this.id('reply');
      this.commentsCount = this.id('comments-count');
      this.ulList = this.id('comments-list');
      this.cancelReply = this.id('cancel-reply');
      this.notif = this.id('notif');

      // Reference to the current URL.
      this.commentsRef = firebase.database().ref('comments').child(this.slugify(window.location.pathname));
    }

    // Creates a Firebase Realtime Database compatible version of the URL.
    slugify(text) {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/&/g, '-and-')
        .replace(/[\s\W-]+/g, '-')
        .replace(/[^a-zA-Z0-9-_]+/g, '');
    }

    id(gId) {
      return document.getElementById(gId);
    }

    getVal(id) {
      return document.getElementById(id).value;
    }

    // Display the total number of comments to #comments-count.
    commentsCountShow(c) {
      this.commentsCount.innerText = c;
    }
  }

  class Submit extends Globals {
    constructor() {
      super();

      // Boolean. Limits the function saveReply to be executed only once per submit event.
      this.fexecuted = true;

      // Stores the clicked reply key in the database.
      this.linkKey = '';
    }

    // Fuction to submit a new comment.
    saveComment(name, md5Email, message) {
      this.commentsRef.push().set({
        name: name,
        message: message,
        md5Email: md5Email,
        postedAt: firebase.database.ServerValue.TIMESTAMP
      });
    }

    // Fuction to submit a new reply.
    saveReply(name, md5Email, message) {
      if (!this.fexecuted) {
        this.commentsRef.child(this.linkKey).child('replies').push().set({
          name: name,
          message: message,
          md5Email: md5Email,
          postedAt: firebase.database.ServerValue.TIMESTAMP
        });
      }
    }

    toggleReplyForm(val1, val2) {
      this.reply.style.display = val1;
      this.comment.style.display = val2;
      
    }
  }

  class Display extends Globals {
    constructor(snap) {
      super();
      this.key = snap.key;
      this.c = snap.val();
      this.li = document.createElement('li');
      this.html = '';
    }

    makeNoFollow(message) {
      message = message.replace('<a ', '<a target="_blank" rel="nofollow noopener" ');
      return message;
    }

    showComments() {
      // Make links nofollow.
      this.c.message = this.makeNoFollow(this.c.message);
      
      // Create comment item markup.
      this.html = `<div class="comment-item">
      <div class="left"><img class="author-grav" src="https://www.gravatar.com/avatar/${this.c.md5Email}?s=80&d=retro"></div>
      <h3>${xssFilters.inHTMLData(this.c.name)}</h3>
      <small>${timeago().format(this.c.postedAt)}</small>
      <p>${xssFilters.inHTMLComment(this.c.message)}</p>
      <button class="comment-reply btn" data-id="${this.key}">Reply</button>
      </div>`;
  
      // Append values to a new list item.
      this.li.innerHTML = this.html;
      this.ulList.appendChild(this.li);

      this.showReplies();
    }

    showReplies() {
      let thisReplyRef = firebase.database().ref('comments/' + this.slugify(window.location.pathname) + '/' + this.key + '/replies');
      thisReplyRef.on('child_added', snap => {
        
        let r = snap.val();
        let liRep = document.createElement('li');
      
        // Make links nofollow.
        r.message = this.makeNoFollow(r.message);
      
        let html = `<div class="reply-item">
        <div class="left"><img class="author-grav" src="https://www.gravatar.com/avatar/${r.md5Email}?s=80&d=retro"></div>
        <h3>${xssFilters.inHTMLData(r.name)}</h3>
        <small>${timeago().format(r.postedAt)}</small>
        <p>${xssFilters.inHTMLComment(r.message)}</p>
        <button class="comment-reply btn" data-id="${this.key}">Reply</button>
        </div>`;
      
        // Append values to a new list item.
        liRep.innerHTML = html;
        this.ulList.appendChild(liRep);

        commentCount += 1;
      });
    }
  }

  let commentCount = 0;
  const g = new Globals();
  const s = new Submit();

  // Listener to submit a new comment.
  comment.addEventListener('submit', (e) => {
    let name = g.getVal('name');
    let message = g.getVal('message');
    let md5Email = md5(g.getVal('email'));

    e.preventDefault();
    s.saveComment(name, md5Email, message);

    // Toggle submit notification.
    g.notif.style.display = "block";
    setTimeout( () => {
      g.notif.style.display = "none";
    }, 3000);

    comment.reset();
  });

  // Listener to the reply button.
  document.addEventListener('click', e => {
    if(e.target.classList.contains('comment-reply')) {

      // Find the key of the clicked "Reply" button from 'data-id' attribute and set it to linkKey.
      s.linkKey = e.target.dataset.id;
      s.fexecuted = false;

      // Get the reply form.
      e.target.insertAdjacentElement('afterend', g.reply);
      s.toggleReplyForm('block', 'none');

    } else { return; }
  });

  // Listener of the submit button of the reply form.
  g.reply.addEventListener('submit', e => {
    let name = g.getVal('name');
    let message = g.getVal('message');
    let md5Email = md5(g.getVal('email'));

    e.preventDefault();
    s.saveReply(name, md5Email, message);
    g.reply.reset();

    s.toggleReplyForm('none', 'block');

    // Toggle submit notification.
    g.notif.style.display = "block";
    setTimeout( () => {
      g.notif.style.display = "none";
    }, 3000);

    s.fexecuted = true;
    
    // Window.reload() because of two bugs:
    // 1. Unexpected behavior. After reply submission, if a comment is submitted, the fields are not properly submitted.
    // 2. Bad UX. New reply is added to the bottom, even after submitting somewhere in the middle.
    window.reload();
  });

  // Cancel reply button listener.
  g.cancelReply.addEventListener('click', () => {
    s.toggleReplyForm('none', 'block');
    s.linkKey = null;
    s.fexecuted = true;   
  });

  // Display comments.
  g.commentsRef.on('child_added', snap => {
    const display = new Display(snap);
    display.showComments();
  });

  // Show the number of comments in the markup.
  g.commentsRef.once("value").then( snap => {
    g.commentsCountShow(snap.numChildren() + commentCount);
  });

})();