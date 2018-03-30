/* 
* Fire Comments JS v0.2.0 (https://github.com/theakshaydhiman/Fire-Comments-JS)
* Copyright 2018 Akshay Dhiman
* MIT License (https://github.com/theakshaydhiman/Fire-Comments-JS/blob/master/LICENSE)
*/

( () => {

  // Create a Firebase Realtime Database compatible version of the URL
  const slugify = text => text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, '-and-')
    .replace(/[\s\W-]+/g, '-')
    .replace(/[^a-zA-Z0-9-_]+/g, '');

  // Get Element ID
  const id = gId => document.getElementById(gId);

  // Get Value of an Element
  const getVal = id => document.getElementById(id).value;

  // References
  const commentsRef = firebase.database().ref('comments').child(slugify(window.location.pathname));

  // Fuction to submit a new comment
  const saveComment = (name, md5Email, message, where) => {
    where.push().set({
      name: name,
      message: message,
      md5Email: md5Email,
      postedAt: firebase.database.ServerValue.TIMESTAMP,
    });
  };

  // Submit new comment at the bottom
  id('comment').addEventListener('submit', (e) => {
    let name = getVal('name');
    let email = getVal('email');
    let message = getVal('message');
    let md5Email = md5(email);

    e.preventDefault();
    saveComment(name, md5Email, message, commentsRef);
    alert('Your comment has been submitted!');
    id('comment').reset();
  });


  // 'linkKey' - stores the clicked reply position
  // 'fexecuted' - boolean, limits the function saveReply to be executed only once per submit event

  let linkKey;
  let fexecuted;

  // Fuction to submit a new reply
  let saveReply = (name, md5Email, message) => {
    if (!fexecuted) {
      commentsRef.child(linkKey).child('replies').push().set({
        name:name,
        message:message,
        md5Email:md5Email,
        postedAt: firebase.database.ServerValue.TIMESTAMP
      });
      alert('Your reply has been submitted!');
      window.fexecuted = true;
    }
  };

  // Reply function
  document.addEventListener('click', e => {

    let targetParent = null;
    
    // Grabbing the clicked "Reply" button
    if(e.target.id === "creply"){

      // Find the key of the clicked "Reply" button
      linkKey = e.target.querySelector('#ckey').innerText;
      console.log(linkKey);
      window.fexecuted = false;

      // Get the reply form
      id('reply-form-title').innerText = 'Reply';
      e.target.insertAdjacentElement('afterend', id('reply'));
      id('reply').style.display = 'block';
      id('comment').style.display = 'none';
      
      // Submit reply
      id('reply').addEventListener('submit', e => {
        let name = getVal('name');
        let email = getVal('email');
        let message = getVal('message');
        let md5Email = md5(email);

        e.preventDefault();
        saveReply(name, md5Email, message);
        id('reply').reset();

        id('reply').style.display = 'none';
        id('comment').style.display = 'block';
      });

      // Cancel Reply
      id('cancel-reply').addEventListener('click', () => {
        id('reply').style.display = 'none';
        id('comment').style.display = 'block';
        window.linkKey = null;
      });
      
    }
  });

  // Variable initialization to count the number of replies only
  let repCount = 0;

  // Display comments
  let ulList = id('comments-list');
  commentsRef.on('child_added', snap => {
    
    let key = snap.key;
    let c = snap.val();
    let li = document.createElement('li');

    // Make links nofollow
    c.message = c.message.replace('<a ', '<a target="_blank" rel="nofollow noopener" ');

    let html = `<div class="comment-item">
    <div class="left"><img class="author-grav" src="https://www.gravatar.com/avatar/${c.md5Email}?s=80&d=retro/"></div>
    <h3>${xssFilters.inHTMLData(c.name)}</h3>
    <small>${timeago().format(c.postedAt)}</small>
    <p>${xssFilters.inHTMLComment(c.message)}</p>
    <button id="creply" class="comment-reply btn"><span id="ckey" style="display:none;">${key}</span>Reply</button>
    </div>`;

    // Append values to a new list item
    li.innerHTML = html;
    ulList.appendChild(li);

    // Function to count the number of replies only
    let countReplies = v => repCount = repCount + v;

    // Display replies
    let thisReplyRef = firebase.database().ref('comments/' + slugify(window.location.pathname) + '/' + key + '/replies');
    thisReplyRef.on('child_added', snap => {
      
      let r = snap.val();
      let liRep = document.createElement('li');
    
      // Make links nofollow
      r.message = r.message.replace('<a ', '<a target="_blank" rel="nofollow noopener" ');
    
      let html = `<div class="reply-item">
      <div class="left"><img class="author-grav" src="https://www.gravatar.com/avatar/${r.md5Email}?s=80&d=retro"></div>
      <h3>${xssFilters.inHTMLData(r.name)}</h3>
      <small>${timeago().format(r.postedAt)}</small>
      <p>${xssFilters.inHTMLComment(r.message)}</p>
      <button id="creply" class="comment-reply btn"><span id="ckey" style="display:none;">${key}</span>Reply</button>
      </div>`;
    
      // Append values to a new list item
      liRep.innerHTML = html;
      ulList.appendChild(liRep);

      countReplies(1);
    });
  });

  // Count the number of comments
  commentsRef.once("value").then( snap => {
      id('comments-count').innerText = snap.numChildren() + repCount;
  });

})();

// Bugs:
// 1. Reply when submitted doesn't show in right order unless the page is refreshed.
// 2. Reply submit, then comment submit gives error.

// Features to be added:
// 1. Recieve notifications when new comments are submitted via nodemailer