### List three bugs that we have encountered so far:
1. Front-end related:
    - As a user, I expected the freedom to create a username of my choice. However, if the username I created is too long, it causes an overflow in the input box. Similar to the calculator spreadsheet formula input part.

    - Repo step: To reproduce the bug (which is now fixed), click the login button and enter an extremely long username. In addition, enter an extremely long formula.



2. Front-end related:
    - As a user, when hitting the “load more” button and there is no history message, I expected to see an alert pop up instead of seeing the system sending a message indicating there are no more history messages. 
 
    - Apparently, there is a bug connected to the handling of system messages in the chat component. The issue seems to be related to the use of 'splice' to remove messages from the array. This could potentially cause complications, especially when loading additional messages.

    - Repo step: To reproduce the bug (which is now fixed), ensure there’s no history message, and then click the “load more” button.


3. Front-end related:
    - The UI of the layout did not appear as we expected – the header bar layout was not responsive to the change of the screen size.	

    - As a user, I expected to see the header bar layout responsive to the change of screen size. But the UI layout didn’t appear as I expected. Clearly, there is a bug in .css file design, I need to modify the css file to solve the bug.

    - Repo step: To reproduce the UI layout bug (which is now fixed),  we change the screen size manually, and can see that the head bar size changed responsively. 

4. Backend-end related:
    - As a user, I expected to be restricted from logging in twice with the same userName. However, I've observed that I can open two web pages simultaneously and log in twice using the same userName. So there is a bug in the database, which fails to verify whether a user is already logged in.

    - Repo step:  To reproduce the bug (which is now fixed), we open two web pages simultaneously and try to log in twice using the same userName, user in the second web page can still send messages to the chatroom.

### List one example of bug fix:
- the forth bug, Backend related:
    - We now have successfully fixed the bug by adding a HashMap in redis, when a user enters the userName, it will check whether the userName already existed.

    - Every time when a user is trying to signin, chat client will ask the chat server whether the username has already been used and send a response to the client, and the client will parse the response. If the server says the username is not available, the front-end will pop up an alert.

    - Unit Test: Add an unit test in /Tests/Unit/ChatClient.test.js to test that it should alert when signing in with an existing username. When the newUser2 sign in for the first time, there should be an alert message “Congratulation! newUser2 have signed in successfully!”. However, if newUser2 sign in twice, there will be an alert message “User newUser2 already signed in!”

    - End-to-end test: Tester manually signed in twice with the same username (newUser2), they saw a pop out window which said “User newUser2 already signed in!”


