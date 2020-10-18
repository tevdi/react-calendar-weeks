React Calendar Weeks
===================================

This component is part of a channel manager application. The customer wanted a week selection that starts on saturday and finishes next friday, week by week following this pattern. So basically, you can select the weeks you want, except the reserved ones, marked in red. In this version for GitHub, there are 3 different of week selections. Red ones, that are reserved and cannot be selected, green ones, available to be selected, and finally the yellow ones, that are high demand and the price is usually higher than the green ones. In the version for production, the data is retrieved from a REST API, and the availability of the weeks never changes (until there are changes in the database), but in this version the availability of the weeks is random when you load a month. So, it's possible that, for instance, we book a week in January (so it's blue, selected), we move to another month, and when we are back to January the selected week that was blue, now is reserved (red). As I said, it's just because of the randomness when loading a month for testing purposes <b>only</b>.

In future versions, I will add the possibility to choose the week range selection that suits to the user instead of from saturday to friday, and some other improvements I have in mind as well.

How to run it
=============

    $ git clone https://github.com/tevdi/react-calendar-weeks.git
    
    $ cd react-calendar-weeks
    
    $ npm install
        
And then, run the project in local:

    $ npm run dev

You can see the app running in <a>http://localhost:8080</a>
