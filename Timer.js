/* @license
 
 This software is distributed under The MIT License (MIT).

 Copyright (c) 2013 Present Creative

 */
import event.Emitter as Emitter;

var DEFAULT_TIMER = 1000;

exports = Class(Emitter, function(supr) {
	this.init = function(opts) {
		supr(this, 'init', [opts]);
		
		//set up array to hold scheduled events
		this._timerEvents = {};
		
		//Get Current Time, set to master clock
		var date = new Date();
		this._masterClock = date.getTime();
		
		GC.app.engine.on('Tick', bind(this,function (dt) {
			//increment master clock by the delta time since last frame
			this._masterClock += dt;  
			this._fireEvents(dt);
		}));
	}
	
	//Get whatever the current master clock is
	this._currentClockTime = function() {
		return new Number(this._masterClock);
	}
	
	
	this._scheduleEvent = function(eventFunc,timer,repeat,limit) {
		//do not schedule if function is not defined
		if(typeof(eventFunc) != "function") { return; } 
		
		timer = timer === undefined ? DEFAULT_TIMER : timer; //when the event should be fired
		repeat = repeat === undefined ? false : repeat; //defaults to a single event
		limit = limit === undefined ? 0 : limit; //defaults to a single event
		
		var currentTime = this._currentClockTime();
		var _event = {
			startTime: currentTime,
			scheduledFiringTime: currentTime + timer,
			repeat: repeat,
			timer: timer,
			loops: 0,
			limit: limit,
			eventFunction: eventFunc,
			fired: false,
		};
		
		var _uid = this._makeEventUID(); //unique identifier
		this._timerEvents[_uid] = _event;
		
		return _uid;
	}
	
	//create a unique identifier
	this._makeEventUID = function() {
	    var str = this._currentClockTime();
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	
	    for( var i=0; i < 5; i++ ) {
		    str += possible.charAt(Math.floor(Math.random() * possible.length));
	    }
		
		//verify the uid is not in use
		if(this._timerEvents[str] === undefined) {
			return str;	
		} else {
			return this._makeEventUID();
		}
	    
	}
		
	//removes event from the firing schedule
	this._removeEvent = function(uid) {
		if(this._timerEvents[uid] === undefined) {
			return false;
		} else {
			delete this._timerEvents[uid];
			return true;
		}
	}
	
	//fire all scheduled events
	this._fireEvents = function() {
		var now = this._currentClockTime();
		var eventsToDelete = [];
		
		//loop through scheduled events and fire the ones necessary
		for(var i in this._timerEvents) {
			var evt = this._timerEvents[i]; 
			
			if(evt.scheduledFiringTime <= now) {
				evt.eventFunction();
				
				//if repeating event, set next timer, else remove the event
				if(evt.repeat) {
					evt.scheduledFiringTime = now + evt.timer;
					evt.loops += 1;
					
					//check for limit
					if(evt.limit > 0 && evt.loops >= evt.limit) {
						eventsToDelete.push(i);	
					}
				} else {
					eventsToDelete.push(i);
				}
			}	
		}
		
		for(var k in eventsToDelete) {
			this._removeEvent(eventsToDelete[k]);
		}
	};
	
	
	//API ACCESSIBLE FUNCTIONS
	this.scheduleSingleEvent = function(eventFunc,timer) {
		return this._scheduleEvent(eventFunc,timer,false); //returns uid of event
	};
	this.scheduleRepeatingEvent = function(eventFunc,timer,limit) {
		limit = limit == undefined ? 0 : limit; //defaults to neverending loop
		return this._scheduleEvent(eventFunc,timer,true,limit); //returns uid of event
	};
	this.cancelEvent = function(uid) {
		return this._removeEvent(uid); //if event is removed, returns true
	}
	this.getEvent = function(uid) {
		return this._timerEvents[uid];
	};
});