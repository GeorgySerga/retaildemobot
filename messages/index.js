/*
 Copyright (c) Microsoft. All rights reserved.
 Licensed under the MIT license.

 Microsoft Cognitive Services (formerly Project Oxford): https://www.microsoft.com/cognitive-services


 Microsoft Cognitive Services (formerly Project Oxford) GitHub:
 https://github.com/Microsoft/ProjectOxford-ClientSDK


 Copyright (c) Microsoft Corporation
 All rights reserved.

 MIT License:
 Permission is hereby granted, free of charge, to any person obtaining
 a copy of this software and associated documentation files (the
 "Software"), to deal in the Software without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of the Software, and to
 permit persons to whom the Software is furnished to do so, subject to
 the following conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

"use strict";

const LUISClient = require("./luis_sdk");

var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');

var useEmulator = (process.env.NODE_ENV == 'development');
//var useEmulator = "True";

console.log ('useEmulator %s',useEmulator);
var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});


const APPID = "Enter your Application Id here";
const APPKEY = "Enter your Subscription Key here";

var LUISclient = LUISClient({
  appId: '965baee4-cb00-4724-8d7d-98675c5cd6c4',
  appKey: '181e01565f894894a05d4eb8c3d342ae',
  verbose: true
});

//var bot = new builder.UniversalBot(connector);


var bot = new builder.UniversalBot(connector, [
    function (session) {
		console.log('Starting message new is %s',session.message.text);
		console.log('Session state in new  one is %s',session.sessionState.callstack.state);
		console.log('Session Reset in new one is %s',session.isReset());
		console.log('Session messageSent new in one is %s',session.messageSent());
		console.log('tesxt to search is %s',session.message.text);
		
		var cards = new Array();
		cards.push(createThumbnailCard(session, "images/customerservice.jpg",'', 'customerService','Customer Service- Refund, Cancel, Order Status Inquiry','Initiate Service Request'));
		cards.push(createThumbnailCard(session, 'http://www.woodtel.com/thumbnail.jpg','', 'initiateBrowsing','Browse and Shop for Products','Shop Now'));
		var reply = new builder.Message(session)
            .text('Our chat agent can help you in following activities')
            .attachmentLayout(builder.AttachmentLayout.list)
            .attachments(cards);
        session.send(reply);
		/*
		var intent='';
		LUISclient.predict(session.message.text, {

				//On success of prediction
					onSuccess: function (response) {
					intent = response.topScoringIntent.intent;
					console.log('intent received is %s',response.topScoringIntent.intent);
					console.log('Intent is:. %s',intent);
		
					var messageToSend=getTextForIntent(intent);
					session.send(messageToSend);
					
					//printOnSuccess(response);
					
			},

			//On failure of prediction
					onFailure: function (err) {
					console.error(err);
			}
		});
		
		*/
        //session.beginDialog('conversationwithuser');
    },
	
    function (session, results) {
		console.log('Session state in two is %s',session.sessionState.callstack.state);
		console.log('Session Reset in two is %s',session.isReset());
		console.log('tesxt to search is %s',results.response);
        //session.dialogData.reservationDate = builder.EntityRecognizer.resolveTime([results.response]);
		
		
		var intent='';
		LUISclient.predict(results.response, {

				//On success of prediction
					onSuccess: function (response) {
					var intent = response.topScoringIntent.intent;
					console.log('intent received is %s',response.topScoringIntent.intent);
					//printOnSuccess(response);
					console.log('Intent is:. %s',intent);
		
					var messageToSend=getTextForIntent(intent);
					session.send(messageToSend);
					
			},

			//On failure of prediction
					onFailure: function (err) {
					console.error(err);
			}
		});
		/*
		console.log('Intent is:. %s',intent);
		//session.routeToActiveDialog(results);
		session.send('Intent is:. %s',intent);*/
		//builder.Prompts.text(session, 'Intent is:. %s',intent);
		
		
        //builder.Prompts.text(session, "How many people are in your party?");

    }
    
]);






bot.localePath(path.join(__dirname, './locale'));

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

//const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;
const LuisModelUrl = 'https://' + luisAPIHostName + 'luis/v2.0/apps/' + APPID + '?subscription-key=' + APPKEY+'&verbose=true&spellCheck=true';

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })

.onDefault((session) => {
    console.log ('AppId:%d',luisAppId);
    session.send('Sorry, I did not understand. In app.js.Again \'%s\'.', session.message.text);
});


bot.recognizer(recognizer);

/*
LUISclient.predict("Assessment", {

  //On success of prediction
  onSuccess: function (response) {
    printOnSuccess(response);
  },

  //On failure of prediction
  onFailure: function (err) {
    console.error(err);
  }
});
*/
/*
bot.dialog('/', [

	function (session, args, next) {
		console.log('session, args, next');
        session.send('Welcome to the IoT: \'%s\'', session.message.text);
		builder.Prompts.text(session, 'Please Let us know how we can help you in IoT');
		var offeringEntity = builder.EntityRecognizer.findEntity('Offerings');
		next({ response: offeringEntity.entity });
        // try extracting entities
       
    },
    function (session, results) {
        var destination = results.response;
		console.log('In session,results');

        var message = 'DUMMY SEARCH RESULT';
        
		//builder.Prompts.text(session, message);
        session.send(message, destination);
		session.endDialog();

        
    },
	
	
]).triggerAction({
    matches: 'Conversation',
    onInterrupted: function (session) {
		console.log('In Trigger action, interrupted');
        session.send('DONT KNOW WHAT TO DO.SORRY');
    }
});

*/
/*
bot.dialog('/', [

	function (session, args, next) {
		console.log('session, args, next');
        session.send('Welcome to the Techolution ');
		builder.Prompts.text(session, 'Please Let us know how we can help you in IoT');
		session.beginDialog('conversation');
		
    }
    	
]);
*/

bot.dialog('conversationwithuser', [


	function (session) {
        //builder.Prompts.time(session, "Please provide a reservation date and time (e.g.: June 6th at 5pm)");
    },
    function (session, results) {
		session.send('You have entered: \'%s\'', session.message.text);
        //session.endDialogWithResult(results);
    }

	/*function (session, args, next) {
		console.log('Conversation session, args, next');
        //session.send('Welcome to the IoT: \'%s\'', session.message.text);
		builder.Prompts.text(session, 'Please Let us know how we can help you in IoT');
        // try extracting entities
       
    },
    function (session, results) {
        var destination = results.response;
		console.log('Conversation In session,results');
		session.send('result is:\'%s\'',results.response);
        var message = 'DUMMY Conversation SEARCH RESULT';
        
		builder.Prompts.text(session, message);
        //session.send(message, destination);

    }*/
	
]);

bot.dialog('SubsequentConversation', [

	function (session, args) {
		console.log('Conversation session, args, next');
        //session.send('Welcome to the IoT: \'%s\'', session.message.text);
		builder.Prompts.text(session, 'Please Let us know how we can help you in IoT');
        // try extracting entities
       
    },
    function (session, results) {
        var destination = results.response;
		console.log('Conversation In session,results');

        var message = 'DUMMY Conversation SEARCH RESULT';
        
		builder.Prompts.text(session, message);
        //session.send(message, destination);

    }
	
]);

bot.dialog('/initiateBrowsing', [
	//function (session){
	//	builder.Prompts.text(session, 'In Initate Message start');
	//},

	function (session, args) {
		var cards = new Array();
		cards.push(createThumbnailCard(session, "https://www.jcrew.com/s7-img-facade/2017nov_w_landing_wk0_lwl?$Mobile_546px_High$",'', 'listPopularWomenProduct','Buy Popular Women Product',"Browse and Shop"));
		cards.push(createThumbnailCard(session, 'https://www.jcrew.com/s7-img-facade/m_cheat_nov17rc?$Mobile_546px_High$','', 'listPopularMenProduct','Buy Popular Men Product',"Browse and Shop"));
		cards.push(createThumbnailCard(session, 'https://www.jcrew.com/s7-img-facade/b_cozy_nov17rc?$Mobile_546px_High$','', 'listPopularBoysProduct','Buy Popular Boys Product',"Browse and Shop"));
		
		var reply = new builder.Message(session)
            .text('Shop from our popular categories')
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(cards);
        session.send(reply);
       
    },
    function (session, results) {
        var destination = results.response;
		console.log('Conversation In session,results');

        var message = 'DUMMY Conversation SEARCH RESULT --'+destination;
        
		builder.Prompts.text(session, message);
        //session.send(message, destination);

    }
	
]);
bot.dialog('/customerService', [
	//function (session){
	//	builder.Prompts.text(session, 'In Initate Message start');
	//},

	function (session, args) {
		console.log('Conversation session, args, next');
        //session.send('Welcome to the IoT: \'%s\'', session.message.text);
		builder.Prompts.text(session, 'Welcome to customer Service');
        // try extracting entities
       
    },
    function (session, results) {
        var destination = results.response;
		console.log('Conversation In session,results');

        var message = 'Customer service results';
        
		builder.Prompts.text(session, message);
        //session.send(message, destination);

    }
	
]);


bot.dialog('/listPopularWomenProduct', [
	//function (session){
	//	builder.Prompts.text(session, 'In Initate Message start');
	//},

	function (session, args) {
		console.log('Conversation session, args, next');
        //session.send('Welcome to the IoT: \'%s\'', session.message.text);
		builder.Prompts.text(session, 'Welcome to Women products');
        // try extracting entities
       
    },
    function (session, results) {
        var destination = results.response;
		console.log('Conversation In session,results');

        var message = 'Customer service results';
        
		builder.Prompts.text(session, message);
        //session.send(message, destination);

    }
	
]);
bot.dialog('/listPopularMenProduct', [
	//function (session){
	//	builder.Prompts.text(session, 'In Initate Message start');
	//},

	function (session, args) {
		console.log('Conversation session, args, next');
        //session.send('Welcome to the IoT: \'%s\'', session.message.text);
		builder.Prompts.text(session, 'Welcome to Mens Product');
        // try extracting entities
       
    },
    function (session, results) {
        var destination = results.response;
		console.log('Conversation In session,results');

        var message = 'Customer service results';
        
		builder.Prompts.text(session, message);
        //session.send(message, destination);

    }
	
]);
bot.dialog('/listPopularBoysProduct', [
	//function (session){
	//	builder.Prompts.text(session, 'In Initate Message start');
	//},

	function (session, args) {
		console.log('Conversation session, args, next');
        //session.send('Welcome to the IoT: \'%s\'', session.message.text);
		builder.Prompts.text(session, 'Welcome to Boys Product');
        // try extracting entities
       
    },
    function (session, results) {
        var destination = results.response;
		console.log('Conversation In session,results');

        var message = 'Customer service results';
        
		builder.Prompts.text(session, message);
        //session.send(message, destination);

    }
	
]);


if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

var printOnSuccess = function (response) {
  console.log("Query: " + response.query);
  console.log("Top Intent: " + response.topScoringIntent.intent);
  console.log("Entities:");
  for (var i = 1; i <= response.entities.length; i++) {
    console.log(i + "- " + response.entities[i-1].entity);
  }
  if (typeof response.dialog !== "undefined" && response.dialog !== null) {
    console.log("Dialog Status: " + response.dialog.status);
    if(!response.dialog.isFinished()) {
      console.log("Dialog Parameter Name: " + response.dialog.parameterName);
      console.log("Dialog Prompt: " + response.dialog.prompt);
    }
  }
};

function getTextForIntent(intentvalue){
	var chatreplytext='';
	if(intentvalue == 'Introduction'){
		chatreplytext='We can help you in Following tasks 1. Customer service 2.Purchase 3.Product Recommendation';
	}else if(intentvalue == 'assessmentdecision'){
		chatreplytext='Please complete the Assement in http://techolution.com/iotAssessment to evalaute your current IoT maturity.';
	}
	else if(intentvalue == 'assessment'){
		chatreplytext='Various industry leaders have started their IoT journey by first evaluating the needs and gaps. We can help you with that thorugh our assessment.';
	}else if(intentvalue == 'assessmentneed'){
		chatreplytext='Various industry leaders have started their IoT journey by first evaluating the needs and gaps. We can help you with that thorugh our assessment.';
	}else if(intentvalue == 'bootcampneed'){
		chatreplytext='As an Individual, first step In IoT is to understand where you stand and identifying your skill gaps. Our bootcamp will help you to identify the gaps and helps you to understand them.';
	}
	else if(intentvalue == 'iotIntroduction'){
		chatreplytext='We help enterprises implement IoT solutions. We also have indutry leading bootcamp to train professionals in IoT.';
	}
	else if(intentvalue == 'service'){
		chatreplytext='We provide Technology consulting in IoT,BigData, Analytics, UI/UX and cloud transformations. We also have indutry leading bootcamp to train professionals in UX,Full Stack development, Data Engineering and IoT.';
	}else if(intentvalue == 'starttraining'){
		chatreplytext='Please start your training by accessing http://iotbootcamp.techolution.com You would first need to take initial assessment.';
	}else if(intentvalue == 'training'){
		chatreplytext='We offer trainings in Cloud transformation,UI/UX,BigData and IoT. We are Microsoft approved trainers and proud partners of Pivotal CloudFoundry.';
	}
	else if(intentvalue == 'training content'){
		chatreplytext='Our IoT training focusses on Azure IoT platform and we cover IoT hub,Device Management,IoT Edge, Stream Analytics, Event Hubs, Event grid,Azure functions, Azure ML,Visualization and HDInsight.';
	}else if(intentvalue == 'contact'){
		chatreplytext='Please drop an e-mail along with your contact number and question to sales@techolution.com  We will get back to you at the earliest.';
	}else if(intentvalue == 'trainingneed'){
		chatreplytext='Our Initial assement test would act as SWOT analysis for your IoT skills and where you need to focus. Take our assessment from http://iotbootcamp.techolution.com';
	}else{
		chatreplytext='Welcome to Techolution. We are visionary IT consulting firm specializing in IoT and Analytics. We would be happy to help you.';
	}
	return chatreplytext;
}



function createThumbnailCard(session,url,textMsg,actionName,titleText,buttonText) {
	
    return new builder.ThumbnailCard(session)
        .title(titleText)
        .subtitle('Shop Now')
        .text(textMsg)
		.images([
            builder.CardImage.create(session, url)
        ])
        .buttons([
            builder.CardAction.dialogAction(session,actionName,"",buttonText)
        ]);
}
bot.beginDialogAction('initiateBrowsing', '/initiateBrowsing'); 
bot.beginDialogAction('customerService', '/customerService'); 
bot.beginDialogAction('listPopularWomenProduct', '/listPopularWomenProduct'); 
bot.beginDialogAction('listPopularMenProduct', '/listPopularMenProduct'); 
bot.beginDialogAction('listPopularBoysProduct', '/listPopularBoysProduct'); 

/*
function(response){
	
	var intentlength=response.entities.length;
}*/	