
/* === Generic Helper Stuff (can be reused) === */

var GameHelperClass = function () {
	this.getRandomNumber = function (min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
}
window.gameHelper = new GameHelperClass();


/* === Phantom Fort/Fortress Game === */

var PFGameClass = function () 
{
	this.isLooping 		= false;
	this.loopTimer 		= 0;
	this.loopIteration 	= 0;
	this.lastTime 		= 0;
	// Constants
	this.loopDelay		= 10;
	// 1000 = 1 second
	// 100 = 1/10th of a second
	// 10 = 1/100th of a second (better than 60 fps)
	this.secondsPerLoop	= (this.loopDelay / 1000);
	// Update certain things once every X iterations
	// 10 ==> once per second
	this.loopModulus	= 10; 
	this.totalPopulation = 314000000;
	
	// Static Data
	this.data = {	// Get from JSON data
		"floors" 	: {}
		,"goons"	: {}
		/*
		"upgrades" 	: {}
		,"groups"	: {}
		*/
	};	
	// Game Data
	this.game = {
		"floorKeyCounter" : 0
		,"floors" : {
			"0" : {
				"floorTypeId" : 0
				,"workerGoonKeyArray" : [0]
			}
		
		}
		,"floorArray" : ["0"] //2,2,2,2,2,2,2,2]
		,"goonKeyCounter" : 0
		,"goons" : {
			"0" : {		// The Phantom Lord
				"goonTypeId" : 0
				,"$elt" : {}
			}
		}
		/*
		,
		"upgrades" : {
			//"industry" : [], "politics" : [], "media" : []
		}
		*/
	};
	
	// Constants, Lookups
	this.currencyTypes = ["gold","souls","arcane","stone","ore","food"];
	this.currencyTypeLongNames = {
		"gold"		: "Gold"
		,"souls" 	: "Soul Shards"
		,"arcane" 	: "Arcane Knowledge"
		,"stone"	: "Stone"
		,"ore"		: "Ore"
		,"food"		: "Food"
	};
	this.floorHeight = 160;
	this.floorWidth = 600;
	
	// Calculated Game Data
	this.topFloorsCount = 0;
	this.bottomFloorsCount = 0;
	this.total = {
		"gold"		: 4000
		,"souls" 	: 1000
		,"arcane" 	: 0
		,"stone"	: 0
		,"ore"		: 0
		,"food"		: 0
	};
	this.perSecond = {
		"gold"		: 0
		,"souls" 	: 0
		,"arcane" 	: 0
		,"stone"	: 0
		,"ore"		: 0
		,"food"		: 0
	};
	

	//=============================================== MAIN LOOP
	
	this.loop = function() {
		var o = this;
		console.log("loop");
	
		o.total.gold 	+= (o.perSecond.gold * o.secondsPerLoop);
		o.total.souls 	+= (o.perSecond.souls * o.secondsPerLoop);
		o.total.arcane 	+= (o.perSecond.arcane * o.secondsPerLoop);
		o.total.stone 	+= (o.perSecond.stone * o.secondsPerLoop);
		o.total.ore 	+= (o.perSecond.ore * o.secondsPerLoop);
		o.total.food 	+= (o.perSecond.food * o.secondsPerLoop);

		if (o.total.gold < 0) 	o.total.gold = 0;
		if (o.total.souls < 0) 	o.total.souls = 0;
		if (o.total.arcane < 0) o.total.arcane = 0;
		if (o.total.stone < 0) 	o.total.stone = 0;
		if (o.total.ore < 0) 	o.total.ore = 0;
		if (o.total.food < 0) 	o.total.food = 0;
		/*
		o.displayNumber(o.total.indMoney, o.$indMoneyVal);
		o.displayNumber(o.total.polMoney, o.$polMoneyVal);
		o.displayNumber(o.total.medMoney, o.$medMoneyVal);
		o.displayNumber(o.total.votes, o.$votesVal);
		o.displayNumber(o.total.minds, o.$mindsVal);
		*/
		o.displayTotals();
		
		// Update these only every second or so... 
		if ((o.loopIteration % o.loopModulus) == 0) {
			o.calculatePerSecondValues();
			
			/*
			o.calculateCoreValues();
			o.displayPerSecondNumbers();
			// Per click...
			o.displayNumber(o.perClick.indMoney, o.$indMoneyPerClickVal);
			o.displayNumber(o.perClick.polMoney, o.$polMoneyPerClickVal);
			o.displayNumber(o.perClick.medMoney, o.$medMoneyPerClickVal);
			o.displayNumber(o.perClick.votes, o.$votesPerClickVal);
			o.displayNumber(o.perClick.minds, o.$mindsPerClickVal);
			*/
		} else if (((o.loopIteration + 1) % o.loopModulus) == 0) {
			/*
			o.displayProgress();
			o.updateUpgradeAfford();
			*/
		} else if (((o.loopIteration + 2) % o.loopModulus) == 0) {
			/*
			if (o.flow.from != "" && o.flow.to != "") {
				var flowSpeed = o.flow.baseSpeed + (o.flow.percentSpeed * o.total[o.flow.from]);
				if (o.total[o.flow.from] >= flowSpeed) {
					o.total[o.flow.from] -= flowSpeed;
					o.total[o.flow.to] += (flowSpeed * o.flow.efficiency);
				}
			}
			*/
		}
		
	
		if (o.isLooping) {
			o.loopIteration++;
			if (o.loopIteration < 15000000) {
				o.loopTimer = window.setTimeout(function(){
					o.loop();
				}, o.loopDelay); 
				
			}
		}
	}

	this.startLoop = function() {
		this.loopIteration = 0;
		this.isLooping = true;
		this.loop();
	}
	
	this.stopLoop = function() {
		this.loopIteration = 0;
		this.isLooping = false;
		clearTimeout(this.loopTimer);
	}

	//=============================================== TOWER MAP CALC, REFRESH, DISPLAY
	
	this.drawTower = function ()
	{
		//console.log(this.data.floors);	console.log(this.game.floors);
		var h = "";
		//var foundGroundFloor = false;
		
		// Loop through all constructed rooms of the tower
		for (var f in this.game.floorArray) {
			var floorKey = this.game.floorArray[f];
			var floorObj = this.game.floors[floorKey];
			var floorTypeObj = this.data.floors[floorObj.floorTypeId];
			h += '<div class="floor viewFloor floor_' + floorTypeObj.name + ' floorKey' + floorKey + '" '
				+ ' data-floorkey="' + floorKey + '">'
				+ 'Floor Key: ' + floorKey
				+ ' floor number ' + f + '-' + floorTypeObj.name 
				+ '</div>';
			//if (floorTypeObj.name == "Base") foundGroundFloor = true;
			//if (foundGroundFloor == true) {
			//	this.bottomFloorsCount++;
			//} else {
			//	this.topFloorsCount++;
			//}
		}
		// Add top and bottom
		h = '<div class="floorTop">TOP</div>' + h + '<div class="floorBottom">BOTTOM</div>';
		this.$floors.html(h);
		
		// Get Y coords of the base and adjust the ground
		var $base = this.$floors.find('.floor_Base');
		if ($base.length == 0) {
			this.notify("ERROR: Base floor not found!");
			console.log($base);
			console.log(this.$floors);
		}
		var basePos = $base.offset();
		var groundHeight = basePos.top + this.floorHeight;
		this.$ground.css("top", groundHeight);
		
		// Get full height and set this to the tower height
		var totalFloorsHeight = ((this.game.floorArray.length + 2) * this.floorHeight);
		this.$floors.css("height", totalFloorsHeight);
		this.$tower.css("height", (totalFloorsHeight + 400)); // 
		
		// Next step: populate the tower with things...
		this.populateTower();
	}
	
	this.populateTower = function ()
	{
		console.log("Populating the Tower with goons");
		// Loop through all constructed rooms of the tower
		for (var f in this.game.floorArray) {
			var floorKey = this.game.floorArray[f];
			var floor = this.game.floors[floorKey];
			var $floor = this.$floors.find('.floorKey' + floorKey);
			$floor.find(".goon").remove();
			console.log("Floor " + floorKey + " workerGoonKeyArrray: [" + floor.workerGoonKeyArray + "]");
			for (var i in floor.workerGoonKeyArray) {
				var goonKey = floor.workerGoonKeyArray[i];
				var goon = this.game.goons[goonKey];
				var goonType = this.data.goons[goon.goonTypeId];
				var goonTypeName = goonType.name.replace(/\s+/g, ''); // Remove spaces
				console.log("Goon key: " + goonKey + ", Type: " + goonType.name);
				var goonHtml = '<div class="goon goon_' + goonTypeName + '">'
					+ goonType.name
					+ '</div>';
				goon.$elt = $(goonHtml);
				goon.$elt.appendTo($floor);
			}
			//console.log($floor.html());
		}
		
		// *** Loop through piles
	}
	
	this.calculateFloorsCounts = function ()
	{
		var foundGroundFloor = false, t = 0, b = 0, fIndex = 0;
		// Loop through all constructed rooms of the tower
		for (fIndex in this.game.floorArray) {
			var floorKey = this.game.floorArray[fIndex];
			var floorObj = this.game.floors[floorKey];
			var floorTypeObj = this.data.floors[floorObj.floorTypeId];
			if (floorTypeObj.name == "Base") foundGroundFloor = true;
			else {
				if (foundGroundFloor == true) {
					b++;
				} else {
					t++;
				}
			}
		}
		this.bottomFloorsCount = b;
		this.topFloorsCount = t;
		
	}
	

	this.viewFloor = function (floorKey) 
	{
		var floorObj = this.game.floors[floorKey];
		var floorTypeObj = this.data.floors[floorObj.floorTypeId];
		var $floorAvailability = this.$floorInfo.find('.floorAvailability').hide();
		var $floorWorkers = this.$floorInfo.find('.floorWorkers').hide();
		var availHtml = "", workersHtml = "";
	
		if (typeof floorTypeObj.workerSpaces === 'undefined') floorTypeObj.workerSpaces = 0;
		if (floorTypeObj.workerSpaces == 0) {
			availHtml = '<p>This floor does not have space for workers.</p>';
		} else {
			if (typeof floorObj.workerGoonKeyArray === 'undefined') floorObj.workerGoonKeyArray = [];
			var workerCount = floorObj.workerGoonKeyArray.length;
			var availCount = floorTypeObj.workerSpaces - workerCount;
			//console.log("Worker Count: " + workerCount + ", Available Count: " + availCount);
			
			for (var i = 0; i < availCount; i++) {
				availHtml += '<li class="emptyWorkerSpace viewAssignWorker" '
					+ ' data-floorkey="' + floorKey + '" >'
					+ 'Worker Needed</li>';
			}			
			for (var i = 0; i < workerCount; i++) {
				var workerGoon = this.game.goons[floorObj.workerGoonKeyArray[i]];
				var goonName = this.data.goons[workerGoon.goonTypeId].name;
				workersHtml += '<li>' + goonName + ' {view} / {dismiss}</li>';
			}
		}
		//console.log(workersHtml);
		
		this.$floorInfo.find('h1.floorName').html(floorTypeObj.name);
		if (availHtml != "") {
			$floorAvailability.fadeIn().children('ul').html(availHtml);
		}
		if (workersHtml != "") {
			$floorWorkers.fadeIn().children('ul').html(workersHtml);
		}
		this.$floorInfo.slideDown(200);
	}
	
	this.refreshFloorPurchase = function (isTop) 
	{
		var h = "";
		// Loop over all floor types
		for (var fId in this.data.floors) {
			var floor = this.data.floors[fId];
			var cost = this.getFloorCost(isTop);
			var affordableClass = (this.total.gold >= cost) ? "canAfford" : "cannotAfford";
			h += '<li class="buyFloor ' + affordableClass + '" '
				+ ' data-floortypeid="' + fId + '"'
				+ ' data-istop="' + isTop + '"'
				+ '>'
				+ floor.name
				+ ' <span class="cost">' + cost + '</span><span class="currencyIcon iconGold">Gold</span>'
				//+ ' <button type="button" class="buyFloor">Buy Floor</button>'
				+ '</li>';
		}
		//h = '<ul class="blockList">' + h + '</ul>';
		//h += '<button type="button" class="closePopUp">X</button>';
		this.$floorPurchase.find("ul").html(h);
		this.$floorPurchase
			.css({ "left": 0, "opacity" : 1 })
			.fadeIn(100);
	}
	
	this.buyFloor = function (isTop, floorTypeId) 
	{
		var o = this;
		var cost = o.getFloorCost(isTop);
		if (o.total.gold > cost) {
			o.eraseCurrency("gold", cost);
			// Add floor to game data
			o.game.floorKeyCounter++;
			var newFloorKey = o.game.floorKeyCounter.toString();
			o.game.floors[newFloorKey] = {
				"floorTypeId" : floorTypeId
				,"workerGoonKeyArray" : []
			};
			console.log("Adding floor, key = " + newFloorKey); console.log(isTop); console.log(this.game.floorArray);
			if (isTop) {
				o.game.floorArray.unshift(newFloorKey);
			} else {
				o.game.floorArray.push(newFloorKey);
			}
			console.log(o.game.floorArray);
			o.drawTower();
		} else {
			o.notify("You cannot afford this floor yet.");
		}
		o.$floorPurchase.animate({
			"left" : 3000
			,"opacity" : 0
		}, 500, function(){
			o.$floorPurchase.hide();
		});
	}
	
	this.getFloorCost = function (isTop)
	{
		this.calculateFloorsCounts();
		console.log("isTop=" + isTop + ", " + this.topFloorsCount + ", " + this.bottomFloorscount);
		// Get cost based on distance from ground floor 
		// *** ...and type of room
		var floorCount = (isTop) ? this.topFloorsCount : this.bottomFloorsCount;
		return (100 + (100 * floorCount));
	}
	
	
	
	//============================================ GOONZ
	
	this.viewGoon = function (goonKey) 
	{
		var h = "";
		// ***
		h += goonKey;
		this.$goonInfo.find('div').html(h);
		this.$goonInfo.slideDown(200);
	}
	
	this.viewGoonAssignment = function (floorKey)
	{
		var h = ""
		for (var goonId in this.data.goons) {
			var goonTypeObj = this.data.goons[goonId];
			if (goonTypeObj.forSale) {
				h += '<li class="buyGoon"'
					+ ' data-floorkey="' + floorKey + '" '
					+ ' data-goontypeid="' + goonId + '" '
					+ '>'
					+ goonTypeObj.name;
				for (var currency in goonTypeObj.cost) {
					// *** fix formatting here
					h += ' ' + goonTypeObj.cost[currency];
					h += ' ' + currency;
				}
					
				h += '</li>';
			}
		}
		// *** List additional unassigned goons
		// *** List working goons that can be re-assigned
		this.$goonAssign.find('ul').html(h);
		this.$goonAssign.slideDown(200);
	
	}
	
	this.buyGoon = function (goonTypeId, floorKey)
	{
		var o = this;
		var goonTypeObj = o.data.goons[goonTypeId];
		var canAfford = true;
		for (var currency in goonTypeObj.cost) {
			if (o.total[currency] < goonTypeObj.cost[currency]) canAfford = false;
		}
		
		if (canAfford) {
			// Remove all payments
			for (var currency in goonTypeObj.cost) {
				o.eraseCurrency(currency, goonTypeObj.cost[currency]);
			}
			// Add goon to game data
			o.game.goonKeyCounter++;
			var newGoonKey = o.game.goonKeyCounter.toString();
			o.game.goons[newGoonKey] = {
				"goonTypeId" : goonTypeId
			};
			console.log("Adding goon, key = " + newGoonKey + ", goonTypeId = " + goonTypeId); 
			// Add goon as a worker to this floor
			o.game.floors[floorKey].workerGoonKeyArray.push(newGoonKey);

			o.$goonAssign.slideUp();		
			
			o.drawTower();
		} else {
			o.notify("You cannot afford this goon.");
		}
	
	}
	
	
	//============================================ CURRENCY / PILE
	
	this.displayTotals = function ()
	{
		this.$currency.find('.goldNum').html(this.getDisplayNumber(this.total.gold));
		this.$currency.find('.soulsNum').html(this.getDisplayNumber(this.total.souls));
		this.$currency.find('.arcaneNum').html(this.getDisplayNumber(this.total.arcane));
		this.$currency.find('.stoneNum').html(this.getDisplayNumber(this.total.stone));
		this.$currency.find('.oreNum').html(this.getDisplayNumber(this.total.ore));
		this.$currency.find('.foodNum').html(this.getDisplayNumber(this.total.food));
	}
	
	this.calculatePerSecondValues = function () 
	{
		// Start at zero
		this.perSecond = {
			"gold"		: 0
			,"souls" 	: 0
			,"arcane" 	: 0
			,"stone"	: 0
			,"ore"		: 0
			,"food"		: 0	
		};
		// Loop through all constructed rooms of the tower
		for (fIndex in this.game.floorArray) {
			var floorKey = this.game.floorArray[fIndex];
			var floor = this.game.floors[floorKey];
			var floorType = this.data.floors[floor.floorTypeId];
			var numOfWorkers = floor.workerGoonKeyArray.length;
			if (typeof floorType.earn === "object") {
				for (var currency in floorType.earn) {
					this.perSecond[currency] += (floorType.earn[currency] * numOfWorkers);
				}
			}
		}
	}

	
	this.eraseCurrency = function (currencyType, amount)
	{
		// *** Change this so if removes currency from piles
		this.total[currencyType] -= amount;
		return true;
	}
	
	
	/*
	this.displayPerSecondNumbers = function () {
		// Per second...
		this.displayNumber(this.perSecond.indMoney, this.$indMoneyPerSecondVal);
		this.displayNumber(this.perSecond.polMoney, this.$polMoneyPerSecondVal);
		this.displayNumber(this.perSecond.medMoney, this.$medMoneyPerSecondVal);
		this.displayNumber(this.perSecond.votes, this.$votesPerSecondVal);
		this.displayNumber(this.perSecond.minds, this.$mindsPerSecondVal);	
	}

	/*
	this.displayNumber = function (n, $elt) {
		//console.log($elt);
		$elt.html(this.getDisplayNumber(n));
	}
	*/
	
	this.getDisplayNumber = function(n) {
		if (n >= 5) n = parseInt(n);
		else n = Math.round( n * 10 ) / 10;
		return n.toLocaleString('en');
	}
	

	

	
	//=============================================== SETUP & LAUNCH
	
	this.notify = function (t) {
		console.warn(t);
		alert(t);
	}

	
	this.setup = function () 
	{
		var o = this;
		var ajaxGetData = {};
		
		
		$.ajax({
			type: 		"get"
			,url:		"data/phantom_data.json"
			,dataType: 	"json"
			,complete: function(x,t) {
			}
			,success: function(responseObj) {
				try {
					//var responseObj = $.parseJSON(response);
					//o.data.upgrades = responseObj.upgrades;
					//o.data.groups 	= responseObj.groups;
					o.data.floors 	= responseObj.floors;
					o.data.goons 	= responseObj.goons;
					console.log("Ajax Success loading data");
				} catch (err) {
					o.notify("ERROR IN JSON DATA");
					console.log(responseObj);
				}
				// Loop through upgrade data and setup default ownership
				/*
				for (sector in o.data.upgrades) {
					o.owned.upgrades[sector] = [];
					for (ug in o.data.upgrades[sector]) {
						o.owned.upgrades[sector][ug] = 0;
					}
				}
				*/
			}
			,failure: function(msg) {
				console.log("Fail\n"+ msg);
			}
			,error: function(x, textStatus, errorThrown) {
				console.log("Error\n" + x.responseText + "\nText Status: " + textStatus + "\nError Thrown: " + errorThrown);
			}
		});
	
	
	
		//=========== Setup UI
		
		o.$tower = $('#tower');
		o.$floors = $('#floors');
		o.$ground = $('#ground');
		o.$floorInfo = $('#floorInfo');
		o.$goonInfo = $('#goonInfo');
		o.$floorPurchase = $('#floorPurchase');
		o.$goonAssign = $('#goonAssign');
		o.$currency = $('#currency');
		
		$('body').on("click", function(e){
			var $target = $(e.target);
			console.log($target);
			if ($target.hasClass("viewFloor")) {
				var floorKey = $target.data("floorkey");
				o.viewFloor(floorKey);
			} else if ($target.hasClass("floorTop")) {
				o.refreshFloorPurchase(true);
				
			} else if ($target.hasClass("floorBottom")) {
				o.refreshFloorPurchase(false);
			} else if ($target.hasClass("buyFloor")) {
				var floorTypeId = $target.data("floortypeid");
				var isTop = $target.data("istop");
				o.buyFloor(isTop, floorTypeId);
			} else if ($target.hasClass("viewAssignWorker")) {
				var floorKey = $target.data("floorkey");
				$target.closest('.popUp').hide(200);
				o.viewGoonAssignment(floorKey);
			} else if ($target.hasClass("buyGoon")) {
				var floorKey = $target.data("floorkey");
				var goonTypeId = $target.data("goontypeid");
				o.buyGoon(goonTypeId, floorKey);
			}
			if ($target.hasClass("closePopUp")) {
				$target.parent().hide(200);
			}
		});
		
		/*
		var $indClicker = $('section.industry .clicker');
		var $polClicker = $('section.politics .clicker');
		var $medClicker = $('section.media .clicker');
		o.$indMoneyVal 			= $('section.industry .money .val');
		o.$indMoneyPerClickVal 	= $('section.industry .profitPerClick .val');
		o.$indMoneyPerSecondVal	= $('section.industry .profitPerSecond .val');
		
		o.$polMoneyVal 			= $('section.politics .money .val');
		o.$polMoneyPerClickVal	= $('section.politics .profitPerClick .val');
		o.$polMoneyPerSecondVal = $('section.politics .profitPerSecond .val');
		o.$votesVal				= $('section.politics .votes .val');
		o.$votesPerClickVal 	= $('section.politics .votesPerClick .val');
		o.$votesPerSecondVal 	= $('section.politics .votesPerSecond .val');
		
		o.$medMoneyVal 				= $('section.media .money .val');
		o.$medMoneyPerClickVal 		= $('section.media .profitPerClick .val');
		o.$medMoneyPerSecondVal 	= $('section.media .profitPerSecond .val');
		o.$mindsVal 				= $('section.media .minds .val');
		o.$mindsPerClickVal 		= $('section.media .mindsPerClick .val');
		o.$mindsPerSecondVal 		= $('section.media .mindsPerSecond .val');		
		
		o.$progressVal = $('section.progress .progressVal');
		o.$progressBar = $('section.progress .progressBar');
		
		$indClicker.click(function(e){	o.industryClick(); });
		$polClicker.click(function(e){	o.politicsClick(); });
		$medClicker.click(function(e){	o.mediaClick(); });
		
		$('.openFoot').click(function(e){
			var $this = $(this);
			if ($this.hasClass("closeFoot")) {
				
				$this.removeClass("closeFoot");
				//$('footer .foot').slideUp(400);
				$('footer').removeClass("open");
				$this.find('span').html("open");
			} else {
				$this.addClass("closeFoot");
				//$('footer .foot').slideDown(400);
				$('footer').addClass("open");
				$this.find('span').html("close");
			}
		});
		*/
		
		$('.save').click(function(e){
			o.playSound("save1");
			o.saveGame(true);
		});
		$('.load').click(function(e){
			o.playSound("save1");
			o.loadGame();
		});
		$('.delete').click(function(e){
			o.playSound("shock1");
			o.deleteGame(true);
			if (confirm("Reload page to start a new game?")) {
				window.location.reload(true); 
			}
		});
		$('.toggleSound').click(function(e){
			var x = o.toggleSound();
			o.notify("Sound turned " + ((x) ? "ON" : "OFF"));
		});
		
		
		/* Intro */
		$('.openWalkthru').click(function(e){
			$(this).fadeOut(200);
			$('section.intro').fadeOut(1000, function(){
				$('section.walkthru').fadeIn(1000, function(){
					$('.threeCols').fadeIn(1000);
				});
			});
		});
		$('.openGame').click(function(e){
			$(this).fadeOut(200);
			$('section.walkthru').fadeOut(1000,function(){
				o.saveGame();
				o.loadGame(true);
			});
		});
		
		
		
		
		var $arrows = $('.focus .arrow');
		$arrows.click(function(e){
			var $thisArrow = $(this);
			if ($thisArrow.hasClass("active")) {
				$arrows.removeClass("active");
				o.flow.from = "";
				o.flow.to = "";
			} else {
				o.playSound("transfer1");
				$arrows.removeClass("active");
				$thisArrow.addClass("active");
				o.flow.from = $thisArrow.data("flowfrom");
				o.flow.to = $thisArrow.data("flowto");
			}
		});
		
		o.$upgradeLists = {};
		
		$('.metrics').click(function(e){
			$(this).find('.perClick').toggle(300);
		});
		
		for (var s in o.sectorArray) {
			(function(sector){
				o.$upgradeLists[sector] = $('section.' + sector + ' ul.upgradeList');
				//console.log("Adding click event to List for sector: " + sector);
				//console.log(o.$upgradeLists[sector]);
				
				o.$upgradeLists[sector].on("click", function(e){
					
					var $target = $(e.target);
					var $ugli = $target.closest('li.upgrade');
					//console.log("List Clicked - sector: " + sector);
					//console.log($ugli);

					if ($target.hasClass("buy") || $target.parent().hasClass("buy")) {
						var upgradeIndex = $ugli.data("ugi");
						o.buyUpgrade(sector, upgradeIndex);
					} else {
						//$ugli.find('.details').toggle();
					}
					e.stopPropagation();
				});
			}(o.sectorArray[s]));
		}
		
		// Scroll Event
		var $win = $(window);
		//var $3cols = $('.threeCols');
		$win.scroll(function() {
			var height = $win.scrollTop();
			//console.log(height);
			if (height > 550) {
				
			} else {
				
			}
		});
		
		
		$('.stopLoop').click(function(e){ 	o.stopLoop(); });
		$('.startLoop').click(function(e){ 	o.startLoop(); });
		
		//$('.upgradeList > li').click(function(e){	o.buyUpgrade(1); });


		//=========== Launch!
		var launchTimer = window.setTimeout(function(){
			o.launch(0);
		}, 250);
	}
	
	this.launch = function (iteration) 
	{
		var o = this;
		iteration++;
		if (Object.keys(o.data.floors).length > 0) {
			console.log("Launching Game!");
			o.loadGame(true);
		} else if (iteration < 40) {
			console.log("Launch... Cannot start yet. " + iteration);
			var launchTimer = window.setTimeout(function(){
				o.launch(iteration);
			}, 250);			
		} else {
			o.notify("Cannot launch game.");
		}
	}
	
	this.saveGame = function(showNotice) 
	{
		localStorage.setItem("owned", JSON.stringify(this.owned));
		localStorage.setItem("total", JSON.stringify(this.total));
		localStorage.setItem("isSoundOn", JSON.stringify(this.isSoundOn));
		
		if (typeof showNotice === 'boolean') { 
			if (showNotice) this.notify("Game has been saved to this browser. Your game will be automatically loaded when you return.");
		}
	}
	
	this.deleteGame = function() 
	{
		localStorage.removeItem("owned");
		localStorage.removeItem("total");
		this.notify("Saved game deleted!");
	}	
	
	this.loadGame = function (isStartLoop) 
	{
		var o = this;
		var isLoaded = false;
		// Load game data (two objects)
		
		/*
		var loadedOwned = localStorage.getItem("owned");
		if (loadedOwned !== null) {
			o.owned = JSON.parse(loadedOwned);
			isLoaded = true;
		}
		var loadedTotal = localStorage.getItem("total");
		if (loadedTotal !== null) {
			o.total = JSON.parse(loadedTotal);
			isLoaded = true;
		}
		*/
		
		var loadedSound = localStorage.getItem("isSoundOn");
		if (loadedSound !== null) {
			o.isSoundOn = JSON.parse(loadedSound);
		}		

		$('body > header').fadeIn(5000);
		if (false /* !isLoaded */) {
			$('.intro').fadeIn(1000);
		} else {
			/*
			o.calculateCoreValues();
			o.writeUpgrades();
			//o.addFlipCardEvents();
			$('.metrics').slideDown(1000);
			$('footer').slideDown(3000);
			$('.progress').show(2000);
			$('.threeCols').fadeIn(2000, function(){
				if (isStartLoop) {
					o.startLoop();
				}
			});
			*/
			o.drawTower();
			if (isStartLoop) {
				o.startLoop();
			}
		}
	}

	
	//========================================= SOUND

	this.isSoundOn = true;
	
	this.toggleSound = function (forceSound) {
		if (typeof forceSound === 'boolean') 	this.isSoundOn = forceSound;
		else									this.isSoundOn = (this.isSoundOn) ? false : true;
		return this.isSoundOn;	
	}

	this.sounds = {
		"coin1" 		: new Audio("sounds/coin1.mp3")
		,"coin2" 		: new Audio("sounds/coin2.mp3")
		,"dud1" 		: new Audio("sounds/dud1.mp3")
		,"dud2" 		: new Audio("sounds/dud2.mp3")
		,"save1" 		: new Audio("sounds/save1.mp3")
		,"transfer1" 	: new Audio("sounds/transfer1.mp3")
		,"upgrade1" 	: new Audio("sounds/upgrade1.mp3")
		,"shock1" 	: new Audio("sounds/shock1.mp3")
	}
	/*
	this.sounds["jibber1"].volume = 0.6;
	this.sounds["jibber2"].volume = 0.6;
	this.sounds["jibber3"].volume = 0.6;
	this.sounds["jibber4"].volume = 0.6;
	this.sounds["glassian"].volume = 0.4;
	*/	
	
	this.playSound = function (soundName, isLooped)
	{
		if (this.isSoundOn) {	
			if (soundName == "coin" || soundName == "dud") {
				soundName += this.roll1d(2);
			}	
			if (typeof this.sounds[soundName] === 'undefined') {
				console.log("Sound does not exist: " + soundName);
				return false;
			} else {
				if (typeof isLooped === 'boolean') {
					this.sounds[soundName].loop = isLooped;
				}
				this.sounds[soundName].play();
				return true;
			}
		} else {
			return false;
		}
	}
	
	this.roll1d = function (sides) {
		return (Math.floor(Math.random()*sides) + 1);
	}


	//========================================= Construction
	if (!window.localStorage) {
		alert("This browser does not support localStorage, so this app will not run properly. Please try another browser, such as the most current version of Google Chrome.");
	}
	if (!window.jQuery) { alert("ERROR - jQuery is not loaded!"); }
}

