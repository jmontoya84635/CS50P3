document.addEventListener('DOMContentLoaded', function () {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    // By default, load the inbox
    load_mailbox('inbox');

    // Listen for send email
    document.querySelector('#submit-email').addEventListener('click', send_email);
});

// Function to show only view you want
function choseView(viewName){
    document.querySelector('#emails-view').style.display = "none";
    document.querySelector('#compose-view').style.display = "none";
    document.querySelector('#single-email-view').style.display = "none";
    document.querySelector(viewName).style.display = "block";
}
// Function to show compose email view
function compose_email() {
    // Show compose view and hide other views
    choseView('#compose-view');

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    choseView('#emails-view');

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
    // Show send email div and none else
    choseView("#compose-view");
    // Grab text fields
    // TODO: add functionality for more than one recipient (in array)
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
        });
}

function load_email(){
    // Single email view
    choseView("#single-email-view");
    // Grab view div
    const singleEmailView = document.querySelector('#single-email-view');
    let header = document.createElement('h1');
    header.innerHTML = "this is a single email view";
    singleEmailView.append(header)
}

function createEmail(id, isRead, recipients, sender, subject, timestamp) {
    // Create div container for each email
    const emailView = document.querySelector('#emails-view');
    // Create card for email
    let card = document.createElement('div');
    card.className = "card".concat(isRead ? " read" : "");
    emailView.append(card);
    // Create link for email
    let link = document.createElement('a');
    link.addEventListener('click', load_email);
    link.className = "email-link"
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