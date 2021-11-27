# Speech-to-text-chat

Slack App to transcribe a call and post it to slack channel.

![image](https://user-images.githubusercontent.com/48346627/143660236-513d660f-d71d-4932-8ec3-714a601c0157.png)

# Installation and Usage

**The content of the channel will be sent to a speech-to-text-chat server I have set up on heroku. Please refrain from using it in channels where confidential information is discussed. This readme also shows how to upload to heroku by yourself. Please use that method.**

**Also, the accuracy of speech recognition is not 100% accurate. In some cases, speech may not be recognized properly or may be converted into words that may be considered offensive. Please be forewarned.**

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

(3-2) launch by slash command.
You can also launch speech-to-text-chat by slash command as below. <room name> is anything ok you want.

```
/speech-to-text-chat <room name>
```

# Build and Deploy

**The accuracy of speech recognition is not 100% accurate. In some cases, speech may not be recognized properly or may be converted into words that may be considered offensive. Please be forewarned.**

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
-   run command to build

```
$ npm install
$ npm run install:front
$ npm run build:front
$ npm run build
```

-   setup heroku app

```
$ heroku login
$ heroku create <app name>
$ git remote -v
$ heroku config:set SLACK_CLIENT_ID=<Client ID>
$ heroku config:set SLACK_CLIENT_SECRET=<Client Secret>
$ heroku config:set SLACK_SIGNING_SECRET=<Signing Secret>
$ heroku config:set SLACK_STATE_SECRET=<any string you want>
$ heroku config:set APP_HEROKU_URL=$(heroku apps:info -s  | grep web_url | cut -d= -f2)
```

-   crate table for the heroku app

```
$ heroku addons:create heroku-postgresql:hobby-dev
$ heroku pg:psql

::DATABASE=> CREATE TABLE auths (team_id varchar(16) primary key, data varchar(2048));
::DATABASE=> CREATE TABLE replace_words (team_id varchar(16) primary key, data varchar(10485760));
```

-   10485760 = 1024*1024*10, max of psql

*   Write down url of the heroku app.

```
$ heroku apps:info -s  | grep web_url | cut -d= -f2
```

-   deploy

```
$ git push heroku master
```

## Slack Setting 2

### create new slash command

Slash Commands -> Create New Command

```
command:
Request URL: <url of the heroku app>slack/events
Short Description: speech-to-text-chat
```

### Interactivity & Shortcuts

Toggle to "On"

```
Request URL: <url of the heroku app>slack/events
```

### Event Subscriptions

Toggle to "On"

```
Request URL: <url of the heroku app>slack/events
Subscribe to bot events: message.channels, message.groups
```

### OAuth & Permissions

```
Redirect URLs:  <url of the heroku app>slack/oauth_redirect
Bot Token Scopes: channels:history, commands, groups:history, chat:write, users:read
```

### Manage Distribution

```
Remove Hard Coded Information: check
```

## Install Slack App

go to `<url of the heroku app>slack/install`

# Reference

# Copyright

see ./LICENSE

Copyright (c) 2021 Wataru Okada <wataru.okada@flect.co.jp>

# NG WORD List

https://wiki.denfaminicogamer.jp/rpgtkoolmvtrinity/%28switch%E7%89%88%E3%81%AE%E3%81%BF%29NG%E3%83%AF%E3%83%BC%E3%83%89%E6%A4%9C%E8%A8%BC%E3%83%AA%E3%82%B9%E3%83%88

(\S*)\s*(\S*)\s*.\* -> {$1:$2},
