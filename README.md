**Integration Metadata**
type=app
name=
domain=
webhookURL=
apiKey=
apiSecret=
ghpToken=

Good morning everybody. 

I still have to update a bit of the documentation to reflect the React Native implementation route, but the rest of your integration setup is ready for you.

For the developers among you, here's the instructions to get the example app up and running:

```shell
$ git clone https://github.com/hellodoctormx/sdk.examples.git

$ cd sdk.examples/react-native

$ yarn install

$ vi app.config.js # replace the empty API_KEY with your key

$ vi android/gpr.properties

### enter the following two lines into the newly created gpr.properties file ###

gpr.user=
gpr.key=

$ yarn android
```

For the non-developers among you, I'm also uploading an APK that you should be able to install directly onto your Android phones (note that iOS is, at present, not yet working on account of some additional server setup on our demo server, that I did not get around to yet. Soon, though.)


A quick tutorial for the example app -

* Press "Sign in" to create a new anonymous user account (in retrospect I should have changed the button label to "Create account", but alas)

* The account creation process should take around 5 - 10 seconds, and you may see some warnings that pop up on the bottom of the screen during that time. You can safely ignore though warnings, unless the account seems to be stuck for more than 20 seconds

* Select a specialty

* Select a time

* Press "Agendar"

... and that's about all it takes, you should then be able to receive the video call whenever your doctor (or tester) launches the call.


Ok, that's it from me for now. If y'all have any questions let me know and I'll get back to you as soon as possible.
