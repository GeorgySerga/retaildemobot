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
		/*
		var cards = new Array();
		cards.push(createThumbnailCard(session, "images/customerservice.jpg",'', 'customerService','Customer Service- Refund, Cancel, Order Status Inquiry','Initiate Service Request'));
		cards.push(createThumbnailCard(session, 'http://www.woodtel.com/thumbnail.jpg','', 'initiateBrowsing','Browse and Shop for Products','Shop Now'));
		var reply = new builder.Message(session)
            .text('Our chat agent can help you in following activities.')
            .attachmentLayout(builder.AttachmentLayout.list)
            .attachments(cards);
        session.send(reply);*/
		//session.beginDialog('generalConversation');

		var intent='';
		LUISclient.predict(session.message.text, {

				//On success of prediction
					onSuccess: function (response) {
					intent = response.topScoringIntent.intent;
					console.log('intent received is %s',response.topScoringIntent.intent);
					console.log('Intent is:. %s',intent);

					console.log('Intent is:. %s',intent);
					if (intent == 'ReturnAndCancellation'){
						session.beginDialog('handleOrderCancellation');
					}else{
						var cards = new Array();
						cards.push(createThumbnailCard(session, "images/customerservice.jpg",'', 'customerService','Customer Service- Refund, Cancel, Order Status Inquiry','Initiate Service Request'));
						cards.push(createThumbnailCard(session, 'http://www.woodtel.com/thumbnail.jpg','', 'initiateBrowsing','Browse and Shop for Products','Shop Now'));
						var reply = new builder.Message(session)
						.text('Our chat agent can help you in following activities.')
						.attachmentLayout(builder.AttachmentLayout.list)
						.attachments(cards);
						session.send(reply);
					}

					//printOnSuccess(response);

			},

			//On failure of prediction
					onFailure: function (err) {
					console.error(err);
			}
		});


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
					if (intent == 'ReturnAndCancellation'){
						session.beginDialog('handleOrderCancellation');
					}else{
						var messageToSend=getTextForIntent(intent);
						session.send(messageToSend);
					}
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

bot.dialog('generalConversation', [


	function (session) {
		var inputMessage=session.message.text;
		console.log('Starting generalConversation is %s',session.message.text);
		if(inputMessage.indexOf('action?') == -1) {


		console.log('Starting generalConversation is %s',session.message.text);
		console.log('Session state in generalConversation is %s',session.sessionState.callstack.state);
		console.log('Session Reset in generalConversation is %s',session.isReset());
		console.log('Session messageSent in generalConversation is %s',session.messageSent());
		console.log('tesxt to search is %s',session.message.text);
		var intent='';
		LUISclient.predict(session.message.text, {

				//On success of prediction
					onSuccess: function (response) {
					intent = response.topScoringIntent.intent;
					console.log('intent received in general conversation is %s',response.topScoringIntent.intent);
					console.log('Intent is:. %s',intent);
          if(intent == 'ReturnReason_LateDeliveryTime'){
            var messageToSend=getTextForIntent(intent);
            console.log('Message received is is:. %s',messageToSend);
  					session.say(messageToSend);
            session.beginDialog('lateDelivery');

          }else{

          }

					//printOnSuccess(response);

			},

			//On failure of prediction
					onFailure: function (err) {
					console.error(err);
			}
		});


        //session.beginDialog('conversationwithuser');
	}else{
		console.log('Not entering as started from other conversation');
    }
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
          //session.beginDialog("generalConversation");

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
		session.beginDialog('generalConversation');

    },
    function (session, results) {
        var destination = results.response;
		console.log('Conversation In session,results');

        var message = 'DUMMY Conversation SEARCH RESULT --'+destination;

		//builder.Prompts.text(session, message);
        //session.send(message, destination);
		session.beginDialog('generalConversation');

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

		//builder.Prompts.text(session, message);
        //session.send(message, destination);
		session.beginDialog('generalConversation');

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

        var message = 'In women product result';

		//builder.Prompts.text(session, message);
        //session.send(message, destination);
		session.beginDialog('generalConversation');

    }

]);
bot.dialog('/listPopularMenProduct', [
	//function (session){
	//	builder.Prompts.text(session, 'In Initate Message start');
	//},
//createThumbnailCardForProducts(session,url,titleText,priceValue,pageUrl)
	function (session, args) {
		var cards = new Array();
		cards.push(createThumbnailCardForProducts(session, "https://www.jcrew.com/s7-img-facade/02402_WX0408",'Slim Secret Wash heather poplin shirt','59.50','https://www.jcrew.com/p/mens_category/shirts/secretwash/slim-secret-wash-heather-poplin-shirt/02403?color_name=hthr-caravan-blue'));
		cards.push(createThumbnailCardForProducts(session, "https://www.jcrew.com/s7-img-facade/H1618_WX0459",'Secret Wash shirt in heather poplin seaside check','55.50','https://www.jcrew.com/p/mens_category/shirts/secretwash/secret-wash-shirt-in-heather-poplin-seaside-check/H1618'));
		cards.push(createThumbnailCardForProducts(session, "https://www.jcrew.com/s7-img-facade/G6974_WX0621",'Slim Secret Wash shirt in thick stripe','57.50','https://www.jcrew.com/p/mens_category/shirts/secretwash/slim-secret-wash-shirt-in-thick-stripe/G6975'));
		cards.push(createThumbnailCardForProducts(session, "https://www.jcrew.com/s7-img-facade/G6986_WN9834",'Secret Wash shirt in warm spruce plaid','69.50','https://www.jcrew.com/p/mens_category/shirts/secretwash/secret-wash-shirt-in-warm-spruce-plaid/G6986'));
		cards.push(createThumbnailCardForProducts(session, "https://www.jcrew.com/s7-img-facade/G6985_WX0431",'Slim heather poplin shirt in purple plaid','62.50','https://www.jcrew.com/p/mens_category/shirts/secretwash/slim-heather-poplin-shirt-in-purple-plaid/G6985'));

		var reply = new builder.Message(session)
           // .text('Our chat agent can help you in following activities')
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(cards);
        session.send(reply);
		session.beginDialog('generalConversation');

    },
    function (session, results) {
        var destination = results.response;
		console.log('Conversation In session,results');

        var message = 'In men product result 2';

		//builder.Prompts.text(session, message);
        //session.send(message, destination);
		session.beginDialog('generalConversation');

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

        var message = 'In boys product result';

		//builder.Prompts.text(session, message);
        //session.send(message, destination);
		session.beginDialog('generalConversation');

    }

]);

bot.dialog('/addToCart', [
	//function (session){
	//	builder.Prompts.text(session, 'In Initate Message start');
	//},

	function (session, args) {
		console.log('Product chosen %s',args);
        //session.send('Welcome to the IoT: \'%s\'', session.message.text);
		builder.Prompts.text(session, 'Product Added to Cart');
        // try extracting entities

    },
    function (session, results) {
        var destination = results.response;
		console.log('Conversation In session,results');

        var message = 'In add to cart result 2';

		//builder.Prompts.text(session, message);
        //session.send(message, destination);
		session.beginDialog('generalConversation');

    }

]);

bot.dialog('handleOrderCancellation', [
    function (session) {
       // session.send('Welcome to the Hotels finder! We are analyzing your message: \'%s\'', session.message.text);

        // try extracting entities
		builder.Prompts.text(session, 'Please enter the order number which you would like to cancel');

    },
    function (session, results) {
		//TODO Order number validation
		builder.Prompts.text(session, 'Thanks for providing the order number. In order to ensure authenticity, we have emailed a OTP send an OTP to the e-mail Id of the order and also the telephone number. Please enter the number to proceed further');

    },
	function (session, results) {
		//TODO Get  status of Order in random from a list of order status and display a message accordingly
		//builder.Prompts.text('Thanks for confirming the order. Since the order is yet to be shipped, we will refund the money in next two working days');
		session.say('Thanks for confirming the order. Since the order is yet to be shipped, we will refund the money in next two working days');
  //  session.beginDialog('generalConversation');
    builder.Prompts.text(session, ' Could you please let us know the reason for the order cancellation');

	},function (session, results) {
		//TODO Get  status of Order in random from a list of order status and display a message accordingly
		//builder.Prompts.text('Thanks for confirming the order. Since the order is yet to be shipped, we will refund the money in next two working days');
		//session.say('Thanks for confirming the order. Since the order is yet to be shipped, we will refund the money in next two working days');
    session.beginDialog('generalConversation');
    //builder.Prompts.text(session, ' Could you please let us know the reason for the order cancellation');

	}
]).triggerAction({
    matches: 'OrderCancellation',
    onInterrupted: function (session) {
        session.send('Starting Order Cancellation');
    }
});


bot.dialog('lateDelivery', [
    function (session) {
       // session.send('Welcome to the Hotels finder! We are analyzing your message: \'%s\'', session.message.text);

        // try extracting entities
        builder.Prompts.choice(session, "Did you try our next day shipping for $20", "Yes|No", { listStyle: builder.ListStyle.button });

	//	     builder.Prompts.text(session, 'Did you try our next day shipping for $50');

    },
    function (session, results) {
		//TODO Order number validation
    console.log("chosen result is %s",results.response.text);
    console.log("chosen result by user  is %s",session.message.text);
    var optionByUser=session.message.text;
    if(optionByUser == 'Yes'){
        session.say("We are sorry that Next day delivery does not meet your requirement.We are working on providing same day delivery capability");
        builder.Prompts.choice(session, "Would you like to check if the product is available in our store in a near by area", "Yes|No", { listStyle: builder.ListStyle.button });
    }else{
      builder.Prompts.choice(session, "Would you like to become our premier member and enjoy free next day shipping for all orders (for just $100 per year)?", "Yes|No", { listStyle: builder.ListStyle.button });
    }

		//builder.Prompts.text(session, 'Thanks for providing the order number. In order to ensure authenticity, we have emailed a OTP send an OTP to the e-mail Id of the order and also the telephone number. Please enter the number to proceed further');

    },
	function (session, results) {

    console.log("chosen result by user  is %s",session.message.text);
    var optionByUser=session.message.text;
     if(optionByUser == 'Yes'){
        session.say("Thanks for expressing interest to become our premier member. Please register by clicking on this link");
        builder.Prompts.confirm(session, "Would you still like to cancel your order?");
     }else{
       builder.Prompts.confirm(session, "Are you sure you wish to cancel your order?");

     }

	},function (session, results) {
    var optionByUser=session.message.text;
    if(optionByUser == 'Yes'){
      session.say("Your order cancellation request has been initiated. You would receive refund in 2 working days");
      builder.Prompts.text(session,"Would you like to give feedback or would like us to help in any ways");
    }else{
        session.say("Thanks for not cancelling the order");
        builder.Prompts.text(session,"Would you like to give feedback or would like us to help in any ways");
    }

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
	}else if(intentvalue == 'offers'){
		chatreplytext='Following offers are currently available 1. 10% off on all purchases above $200. 2. Free next day delivery on all orders above $100 3.Free shipping on all orders above $75';
	}else if (intentvalue == 'ReturnReason_LateDeliveryTime'){
    chatreplytext = 'We are sorry that we take longer than your expected time';
  }else{
		chatreplytext='Please contact our customer support at 1-800-562-0258 to help you further.';
	}
	/*else if(intentvalue == 'assessment'){
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
	}*/
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



function createThumbnailCardForProducts(session,url,titleText,priceValue,pageUrl) {

    //return new builder.ThumbnailCard(session)
	return new builder.HeroCard(session)
        .title(titleText)
        //.subtitle('Shop Now')
        .text("$"+priceValue)
		.images([
            builder.CardImage.create(session, url)
        ])
        .buttons([
            builder.CardAction.dialogAction(session,"addToCart","","Add to Cart"),
			builder.CardAction.openUrl(session,pageUrl,"See in website")
        ]);
}

bot.beginDialogAction('initiateBrowsing', '/initiateBrowsing');
bot.beginDialogAction('customerService', '/customerService');
bot.beginDialogAction('listPopularWomenProduct', '/listPopularWomenProduct');
bot.beginDialogAction('listPopularMenProduct', '/listPopularMenProduct');
bot.beginDialogAction('listPopularBoysProduct', '/listPopularBoysProduct');
bot.beginDialogAction('addToCart', '/addToCart');

/*
function(response){

	var intentlength=response.entities.length;
}*/
