# Speech-to-text-chat

Slack App to transcribe a call and post it to slack channel.

![image](https://user-images.githubusercontent.com/48346627/143660236-513d660f-d71d-4932-8ec3-714a601c0157.png)

# Installation and Usage

(1) Install Slack App

Click this and check scopes used in this app.
[Install!](https://speech-to-text-chat.herokuapp.com/slack/install)

Then, click "Allow" button.

![image](https://user-images.githubusercontent.com/48346627/143661309-165c2190-23d7-41df-b5a6-931b46e0a2c8.png)

(2) Invite Slack App and enable it

Then, Sign in to slack. And invite the speech-to-text-chat to any channel you want to use.

(3) launch speech-to-text-chat

There are two ways to launch an application.

(3-1) launch by slack call.
When you start a call, speech-to-text-chat detect the event and post the message as below. Click "join".

![image](https://user-images.githubusercontent.com/48346627/143661589-2facc2d8-cbc7-47ed-8bc5-4c13e695e1e8.png)

Then, you can see the message as below.

![image](https://user-images.githubusercontent.com/48346627/143661617-8e3d1937-3786-44ff-8cce-d41e42ccd933.png)

When you click "openTab", new tab is opened and you see the screen as below. If if you can see the "LISTENING", preparing is succeeded.

![image](https://user-images.githubusercontent.com/48346627/143660092-67bd2444-68b8-4e78-a28a-5e9594fb52c9.png)

Your voice is showed in the channel.

![image](https://user-images.githubusercontent.com/48346627/143660236-513d660f-d71d-4932-8ec3-714a601c0157.png)

# Build and Deploy

## Prerequisite

-   [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

## Slack Setting 1

-   Create new Slack App from scatch in the [slack api](https://api.slack.com/)
    App name and workplace is anythin ok you want.
-   Write down basic information of the app.
    -   Client ID
    -   Client Secret
    -   Signing Secret

## build and deploy to heroku

-   clone this repository
-   npm install
-

# Reference

# Copyright

see ./LICENSE

Copyright (c) 2021 Wataru Okada <wataru.okada@flect.co.jp>
