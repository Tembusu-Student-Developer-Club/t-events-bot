#done
## document SQL to create database
dbCreation.sql at root  
## new db master table
to store wait time and other variables  
method in queries to get variable  
method in queries for admins to set variable  
## waiting time
participants can get waiting time
admins can set waiting time
## add global list of admins
no longer by station/timeslot  
remove station-based admins  
stored in .env
## change max to global
max queue length per slot
use this variable to check when enqueueing
## changing timeslots to stations
enable /timeslots as an alias of /stations
##adapt commands
leavequeue can be disabled, to disallow people from changing slots
## /ticket
prints out a message stating student's timeslot and username
## remove getfront, pingfront, queueinfo, removefront
## getAll
show all timeslots and participants in them

# potential modifications
## get number of sign ups per slot without listing usernames
## change max to global
in joinqueue, only show options that are not full
## changing stations to timeslots
hide expired timeslots
## getCurrent
requires setting/detecting the current timeslot
get participants for current timeslot