campus life planner 
1.project description 

campus life planner is a responsive website that helps students organize their campus activities.students can plan assignments,study sessions,meeetings,sports,career events, and personal activities.

the website is designed to work on mobile phones,tablets, and desktop computers.

## live project
**project url:** https://cumurerwa-bot.github.io/campus-life-planning/

**demo video:**https://youtu.be/vlxsCbGlXrI

2.main features

- Add new activities.
-Edit existing activities.
-Delete activities.
-Mark activities as completed or planned.
-search activities using regular expressions.
Highlight matching search results.
-sort activities by date,title, and priority.
-save activities using browser localstorage.
-Display dashboard statistics.
-show the most common activity category.
-display activity trends for the next seven days.
-set a completion target and track progress.
-Import activities from JSON files.
-Export activities to JSON  files.
-Load sample activities 
-validate user input.
-use keyboard-accessible controls and sematic html.

3.technologies used

-HTML5 for the structure of the website.
-css3 for styling and responsive design.
-javascript for interaction and application logic.
-Regular expression for input validation and searching.
-localstorage for saving data in the browser.
-JSON for importing and exporting activities.

4. Project files 

-'index.html'-the main website 
-'style.cc'-the website design and responsive layout.
-'script.css'-interactive feautures and validation.
-'seed.json'-sample activity data.
-'tests.html'-basic validation and regular-expression tests.
-'README.md'-project documentation.

5.how to run the project

1.put all six files in the same folder.
2.open 'index.html' in a web browser.
3.Add an activity using the form.
4.search, sort,edit, complete, or delete activities.
5.use the settings section to manage your target and data.
6.open 'tests.html' to run the basic project tests.

6.how to import sample data

1.open the main website.
2. find the import and export section.
3.click Import JSON.
4.select the 'sseed.json' file.
5.comfirm that the activities appear in the list.

7. responsive design

the website uses a moble-first approach

-the default css layout supports smaller screens.
-At 600px,the layout adjusts for tables.
-At 800px, the activity planner uses a wider two-column layout.
-At 1100px, the activity cards use addditional columns.

These breakpoints help the website adapt to different screen sizes.


8. Input validation and regular Expression

Regular expressions validate activity titles, categories, descriptions, and times 


The project also uses:
-A postive  lookahead pattern to demonstrate checking for a digit.

-A back-reference patter to detect repeated words.
-Regular-expression seraching to find activities.
-Error handling with 'try...catch' for valid search aptterns and JSON imports.

9.  DATA STORSGE 

Activities are saved in browser localstorage .This means the data normally remains available when the same broswer is reopened.
Export your activities to a JSON file if you want to keep a separate backup or move data to another browser.

10. Testing 

open'tests.html' in a browser to check basic validation rules, date and time formats,and regular-expression behaviour.

Also test the main website manually by addig ,editing ,deleting, searching, sorting,completig, and exporting activities.

11.Limitations

-Data is stored in the  current browser rather than a shared online database
-Clearing browser storage can remove saved activities.
-imported data must follow the expected activity structure.
-The application does not send reminders or notifications.

12. Future improvements

possible future improvements include:
-calender views.
-notifications for approaching deadlines.
-user accounts.
-cloud-based storage.
-collaboration between students.


