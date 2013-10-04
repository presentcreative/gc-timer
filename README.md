gc-timer
========
##Event Schedule Manager for Game Closure

The purpose of this class is to unify any timed events with Game Closure's game clock. This also allows for easy scoping of the this parameter within the callback function using the bind function within GC. Without specifying the scope using bind, the scope of this reverts to the event object.

##Usage
Copy Timer.js into your src directory and call an instance of the timer. It's usually best to only have 1 timer, and attach it to a property of GC.app for easy access:

		import src.Timer as Timer;
		
		exports = Class(GC.Application, function () {
			this.initUI = function () {
				this.timer = new Timer();
				
				this.timer.scheduleSingleEvent(bind(this,function(){
					console.log("***EVENT FIRED AFTER 2 SECONDS");
				}), 2000);
			}
		});
		
		
##Methods

###Schedule a single event
		
		//Returns a reference to the event for future cancelation
		myEvt = Timer.scheduleSingleEvent(callback,timeDelay);

###Schedule a repeating event
		
		//Returns a reference to the event for future cancelation.  If limit parameter is not provided, loop will be infinite.
		myEvt = Timer.scheduleRepeatingEvent(callback,timeDelay [, limit]);

###Cancel an event
		
		myEvt = Timer.cancelEvent(myEvt); //myEvt = the refernce returned when the event was scheduled
