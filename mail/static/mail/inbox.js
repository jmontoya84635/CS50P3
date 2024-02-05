window.onpopstate = function (event) {
    console.log(event.state.view);
    choseView(event.state.view)
}
document.addEventListener('DOMContentLoaded', function () {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', () => compose_email());

    // By default, load the inbox
    load_mailbox('inbox');

    // Listen for send email
    document.querySelector('#submit-email').addEventListener('click', send_email);
});

function pushStateIfDifferent(view) {
    if (history.state === null || history.state.view !== view) {
        history.pushState({view: view}, "", view);
    }
}

// Function to show only view you want
function choseView(viewName) {
    document.querySelector('#emails-view').style.display = "none";
    document.querySelector('#compose-view').style.display = "none";
    document.querySelector('#single-email-view').style.display = "none";
    document.querySelector(viewName).style.display = "block";
}

// Function to show compose email view
function compose_email
(
    recipient = false,
    subject = false,
    body = false,
    timestamp = false,
    sender = false
) {

    // Show compose view and hide other views
    const view = '#compose-view'
    pushStateIfDifferent(view);
    choseView(view);

    console.log(typeof recipient);
    if (!recipient) {
        recipient = "";
    }

    if (subject) {
        if (subject.substring(0, 3) !== "RE:") {
            subject = `RE: ${subject}`;
        }
    } else {
        subject = "";
    }

    if (body) {
        body = `On ${timestamp}, ${sender} wrote: ${body}\n\nREPLY:\n`;
    } else {
        body = "";
    }

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = recipient;
    document.querySelector('#compose-subject').value = subject;
    document.querySelector('#compose-body').value = body;
}

function load_mailbox(mailbox) {
    // Show the mailbox and hide other views
    const view = '#emails-view'
    pushStateIfDifferent(view);
    choseView(view);

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    // Grab emails for given mailbox name
    fetch(`/emails/${mailbox}`, {
        method: 'GET',
    })
        .then(response => response.json())
        .then(result => {
            // Do something with them
            for (let i = 0; i < result.length; i++) {
                createEmail(
                    result[i]["id"],
                    result[i]["read"],
                    result[i]["recipients"],
                    result[i]["sender"],
                    result[i]["subject"],
                    result[i]["timestamp"],
                );
            }
            console.log(result)
        })
}

function send_email() {
    // Grab text fields
    const recipients = document.querySelector('#compose-recipients');
    const subject = document.querySelector('#compose-subject');
    const body = document.querySelector('#compose-body');

    // Make post request with given fields
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: recipients.value,
            subject: subject.value,
            body: body.value,
        })
    })
        .then(response => response.json())
        .then(result => {
            console.log(result)
            choseView('#emails-view');
            pushStateIfDifferent('#emails-view');
        });
    return false;
}

function load_email(id) {
    // Single email view
    const view = '#single-email-view'
    pushStateIfDifferent(view);
    choseView(view);

    // fetch email
    fetch(`emails/${id}`, {
        method: 'GET',
    })
        .then(response => response.json())
        .then(result => {
            // Grab view div
            let header = document.querySelector('#single-email-sender');
            header.innerHTML = `From ${result.sender}`;
            let timestamp = document.querySelector('#single-email-timestamp');
            timestamp.innerHTML = result.timestamp;
            let recipients = document.querySelector('#single-email-recipients');
            recipients.innerHTML = `To ${result.recipients}`;
            let subject = document.querySelector('#single-email-subject')
            subject.innerHTML = `${result.subject}`;
            let body = document.querySelector('#single-email-body');
            body.innerHTML = result.body;
            let replyButton = document.querySelector('#single-email-reply');
            replyButton.addEventListener('click', function () {
                compose_email(result.recipients, result.subject, result.body, result.timestamp, result.sender);
            });
            let archiveButton = document.querySelector('#single-email-archive');
            let desiredArchiveOption = !result.archived;
            if (!desiredArchiveOption) {
                archiveButton.innerHTML = "Unarchive";
                archiveButton.className = "ml-2 btn btn-outline-success";
            } else {
                archiveButton.innerHTML = "Archive";
                archiveButton.className = "ml-2 btn btn-outline-danger";
            }

            archiveButton.addEventListener('click', function () {
                fetch(`emails/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: desiredArchiveOption,
                    })
                })
                    .then(result => {
                        console.log(result);
                        location.reload();
                    })
            })
        });
    fetch(`emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    }).then(r => console.log(r))
}

function createEmail(id, isRead, recipients, sender, subject, timestamp) {
    // Create div container for each email
    const emailView = document.querySelector('#emails-view');
    // Create card for email
    let card = document.createElement('div');
    card.className = "card my-2 ".concat(isRead ? " read" : "");
    emailView.append(card);
    // Create link for email
    let link = document.createElement('a');
    link.addEventListener('click', function () {
        load_email(id);
    });
    link.className = "email-link";
    card.append(link);
    // Create parent
    let cardBody = document.createElement('div');
    cardBody.className = "card-body";
    link.append(cardBody);

    // Create header for email
    let child = document.createElement('h5');
    child.innerHTML = `from ${sender} to ${recipients}`;
    child.className = "card-title";
    cardBody.append(child);

    // Add timestamp
    child = document.createElement('p');
    child.innerHTML = timestamp;
    child.className = 'card-subtitle mb-2 text-body-secondary';
    cardBody.append(child);

    // Add subject
    child = document.createElement('h6');
    child.innerHTML = subject;
    child.className = 'card-text'
    cardBody.append(child);

    return false
}