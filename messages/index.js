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
			
			console.log("LAST OPS:",session.conversationData.lastops);
			if(!session.conversationData.lastops){
				console.log("INSIDE null of lastops");
				var intent='NA';
				
				LUISclient.predict(session.message.text, {
					
						//On success of prediction
							onSuccess: function (response) {
								
							intent = response.topScoringIntent.intent;
							console.log('Response is');
							console.log(response.topScoringIntent);
							console.log(response)
							var score= response.topScoringIntent.score;
							
							
							console.log('intent received in start is %s',response.topScoringIntent.intent);
							
							console.log('Intent start is:. %s',intent);
							if(score < 0.4){
								console.log('Setting intent in start to NA as score of top scoring intetnt is %s',score);
								intent='NA';
							}
							
							console.log("Intent received is %s",intent )
							if(intent == 'Introduction' ){
								var hours = (new Date()).getUTCHours()-5;
							if (hours <12){
									session.send( 'Good morning. Please let us know how we can help you.');
							}else if(hours <18){
								session.send('Good Afternoon. Please let us know how we can help you.');
							}else{
								session.send('Good Evening. Please let us know how we can help you.');
							}
							var messageTyped=session.message.text;
							session.conversationData.lastops='start';
							}else{
								var dialog=getDialogForIntent(intent);
								session.beginDialog(dialog);
								
							}
							
							},

					//On failure of prediction
							onFailure: function (err) {
							console.error(err);
							
						}
				});
				
				
				
				
				//handleIntentForMessages(session);
				
			}else{
				console.log("INSIDE lastops Not null :",session.conversationData.lastops);
				if(session.conversationData.lastops == 'startOrderCancellation'){
					session.beginDialog('handleOrderCancellationSimplified');
					
				}
				else{
					handleIntentForMessages(session);
				}
				
			}
			
		}
		

]);


bot.dialog('generalConversationNew', [


	function (session) {
			builder.Prompts.text(session, 'Please let us know how we can help you.');	
			
		},
    function (session,results) {
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

		handleIntentForMessages(session);


        //session.beginDialog('conversationwithuser');
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
		//session.beginDialog('generalConversation');
		session.endDialog();

    }

]);
bot.dialog('/customerService', [
	//function (session){
	//	builder.Prompts.text(session, 'In Initate Message start');
	//},

	function (session) {
		console.log('Conversation session, args, next');
        //session.send('Welcome to the IoT: \'%s\'', session.message.text);
		session.send('Welcome to customer Service');
		session.send('We can help you in tracking order status and address change of order');
        // try extracting entities
		session.endDialog();
		session.conversationData.lastops='customerservice';

    }
]).triggerAction({
    matches: [/service/i,/customer service/i, /customerservice/],
    onInterrupted: function (session) {
       session.send('Welcome to customer Service');
		session.send('We can help you in tracking order status and address change of order');
		session.conversationData.lastops='customerservice';
    }
});


bot.dialog('/listPopularWomenProduct', [
	//function (session){
	//	builder.Prompts.text(session, 'In Initate Message start');
	//},

	function (session, args) {
		console.log('Conversation session, args, next');
        //session.send('Welcome to the IoT: \'%s\'', session.message.text);
		builder.Prompts.text(session, 'Welcome to Women products');
		session.conversationData.lastops='listPopularWomenProduct';
        // try extracting entities
		session.endDialog();

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
		session.conversationData.lastops='listPopularMenProduct';
		//session.beginDialog('generalConversation');

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
		session.conversationData.lastops='listPopularBoysProduct';

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
		session.conversationData.lastops='addToCart';
        // try extracting entities
		session.endDialog();

    }

]);

bot.dialog('handleOrderCancellation', [
    function (session) {
       // session.send('Welcome to the Hotels finder! We are analyzing your message: \'%s\'', session.message.text);

        // try extracting entities
		session.conversationData.lastops='startOrderCancellation';
		session.send( 'Please enter the order number which you would like to cancel');
		session.endDialog();

    }
]);




bot.dialog('lateDelivery', [
    function (session) {
       // session.send('Welcome to the Hotels finder! We are analyzing your message: \'%s\'', session.message.text);

        // try extracting entities
        var messageToSend=getTextForIntent('ReturnReason_LateDeliveryTime');
      //  console.log('Message received is is:. %s',messageToSend);
        session.say(messageToSend);
        builder.Prompts.choice(session, "Did you try our next day shipping for $20", "Yes|No", { listStyle: builder.ListStyle.button });

	//	     builder.Prompts.text(session, 'Did you try our next day shipping for $50');

    },
    function (session, results) {
		//TODO Order number validation
    console.log("chosen result is %s",results.response.text);
    console.log("chosen result by user  is %s",session.message.text);
    var optionByUser=session.message.text;
    if(optionByUser.toUpperCase() == 'YES'){
        session.say("We are sorry that Next day delivery does not meet your requirement.We are working on providing same day delivery capability");
        builder.Prompts.choice(session, "Would you like to check if the product is available in our store in a near by area", "Yes.Check in Store near me|No", { listStyle: builder.ListStyle.button });
    }else{
      builder.Prompts.choice(session, "Would you like to become our premier member and enjoy free next day shipping for all orders (for just $100 per year)?", "Yes|No", { listStyle: builder.ListStyle.button });
    }

		//builder.Prompts.text(session, 'Thanks for providing the order number. In order to ensure authenticity, we have emailed a OTP send an OTP to the e-mail Id of the order and also the telephone number. Please enter the number to proceed further');

    },
	function (session, results) {

    console.log("chosen result by user  is %s",session.message.text);
    var optionByUser=session.message.text;
     if(optionByUser.toUpperCase() == 'YES'){
        session.say("Thanks for expressing interest to become our premier member. Please register by clicking on this link");
        builder.Prompts.confirm(session, "Would you still like to cancel your order?");
     }else if(optionByUser.toUpperCase() == 'YES.CHECK IN STORE NEAR ME'){
        session.beginDialog('optionForBOPS');
        //session.endDialogWithResult();
     }
     else{
       builder.Prompts.confirm(session, "Are you sure you wish to cancel your order?");

     }

	},function (session, results) {
    var optionByUser=session.message.text;
    if(optionByUser.toUpperCase() == 'YES'  ){
      session.say("Your order cancellation request has been initiated. You would receive refund in 2 working days");
      builder.Prompts.text(session,"Would you like to give feedback or would like us to help you in any ways");
    }else if(optionByUser.toUpperCase() == 'NO'  ){
        session.say("Thanks for not cancelling the order");
        builder.Prompts.text(session,"Would you like to give feedback or would like us to help you in any ways");
    }else{
      session.endDialogWithResult();
    }

	}
]);

bot.dialog('optionForBOPS', [
    function (session) {
      session.say("We have the same product available at a store 3 miles from your zip code at the same price.");
      builder.Prompts.confirm(session, "Would you be able to pick up from store ?");
    },
    function (session, results) {
      var optionByUser=session.message.text;
      if(optionByUser.toUpperCase() == 'YES'  ){
        session.conversationData.storepickup='YES'
        builder.Prompts.confirm(session, "Amount would be adjusted accordingly. You do not require to pay anything now. Shall we order on your behalf?");
      }else{
          session.conversationData.storepickup='NO'
          session.beginDialog('optionForBOPSNoOrder');
        //  session.endDialogWithResult();
      }
    },
    function (session, results) {
        var optionByUser=session.message.text;
        var previousselection=session.conversationData.storepickup;
        if(optionByUser.toUpperCase() == 'YES'  ){
          session.say("Thanks for choosing to order from store. You will receive e-mail wih order details.");
          builder.Prompts.text(session,"Please provide your feedback as it would help us to serve you better");
        //  session.endDialog();
      }else if (previousselection != 'NO'){
          session.say('Unfortunately, due to regulations we cannot ship from store.');
          builder.Prompts.confirm(session, "Would you Still like to cancel your order?");
        }else{
          session.endDialog();
        }
    },
    function (session, results) {
      var optionByUser=session.message.text;
      if(optionByUser.toUpperCase() == 'YES'  ){
        session.say("Your order cancellation request has been initiated. You would receive refund in 2 working days");
        builder.Prompts.text(session,"Would you like to give feedback or would like us to help you in any ways");

      }else if (optionByUser.toUpperCase() == 'NO') {
        session.say("Thanks for not cancelling the order");
        builder.Prompts.text(session,"Would you like to give feedback or would like us to help you in any ways");

      }else{
        session.endDialogWithResult(results);

      }
    }
]);

bot.dialog('optionForBOPSNoOrder', [
    function (session) {
      session.say('Unfortunately, due to regulations we cannot ship from store.');
      builder.Prompts.choice(session, "Would you Still like to cancel your order?", "Yes.Cancel my order|No", { listStyle: builder.ListStyle.button });
      //NOT WAITIng for RESULTS SO REPLACING IT WITH CHOICE
      //builder.Prompts.confirm(session, "Would you Still like to cancel your order?");
    },
    function (session, results) {
      var optionByUser=session.message.text;
      if(optionByUser == 'Yes.Cancel my order'  ){
        session.say("Your order cancellation request has been initiated. You would receive refund in 2 working days");
        builder.Prompts.text(session,"Would you like to give feedback or would like us to help you in any ways");
        //session.endDialogWithResult();
      }else{
        session.say("Thanks for not cancelling the order");
        builder.Prompts.text(session,"Would you like to give feedback or would like us to help you in any ways");
        //session.endDialogWithResult();
      }
    }
]);


bot.dialog('handleProductStatusInvalid', [
    
  /*  function (session, results) {
		//TODO Order number validation
    var orderNumber= results.response;
    session.conversationData.orderNUmber=orderNumber;
		//builder.Prompts.text(session, 'Thanks for providing the order number. In order to ensure authenticity, we have emailed a OTP send an OTP to the e-mail Id of the order and also the telephone number. Please enter the number to proceed further');
    session.send('Thanks for providing the order number.');
  },*/
  
	function(session){
		session.conversationData.lastops='handleProductStatusInvalid';
		builder.Prompts.text(session,'Order number provided does not exist. Please enter a valid order number');
	},
 	function (session,results) {
		
	

	
    var orderNumber= results.response;
    session.conversationData.orderNUmber=orderNumber;
		//builder.Prompts.text(session, 'Thanks for providing the order number. In order to ensure authenticity, we have emailed a OTP send an OTP to the e-mail Id of the order and also the telephone number. Please enter the number to proceed further');
    session.send('Thanks for providing the order number.');
		//TODO Get  status of Order in random from a list of order status and display a message accordingly
		//builder.Prompts.text('Thanks for confirming the order. Since the order is yet to be shipped, we will refund the money in next two working days');
		//session.say('Thanks for confirming your identity.');
    console.log ('order number is %s' ,orderNumber);
	if(orderNumber < 10000 || orderNumber >1000000){
		//session.send('Please enter a valid order number');
		//session.endDialog();
		session.beginDialog('handleProductStatusInvalid');
		//session.
	}else{
	//	session.endDialog();
		session.beginDialog('handleProductStatusValid');
		session.endDialog();
	}
    

	}
]);



bot.dialog('handleProductStatus', [
    function (session) {
       // session.send('Welcome to the Hotels finder! We are analyzing your message: \'%s\'', session.message.text);
		session.conversationData.lastops='handleProductStatusStart';
        // try extracting entities
		builder.Prompts.text(session, 'Please enter your order number');

    },
  /*  function (session, results) {
		//TODO Order number validation
    var orderNumber= results.response;
    session.conversationData.orderNUmber=orderNumber;
		//builder.Prompts.text(session, 'Thanks for providing the order number. In order to ensure authenticity, we have emailed a OTP send an OTP to the e-mail Id of the order and also the telephone number. Please enter the number to proceed further');
    session.send('Thanks for providing the order number.');
  },*/
 	function (session, results) {

    var orderNumber= results.response;
    session.conversationData.orderNUmber=orderNumber;
		//builder.Prompts.text(session, 'Thanks for providing the order number. In order to ensure authenticity, we have emailed a OTP send an OTP to the e-mail Id of the order and also the telephone number. Please enter the number to proceed further');
    session.send('Thanks for providing the order number.');
		//TODO Get  status of Order in random from a list of order status and display a message accordingly
		//builder.Prompts.text('Thanks for confirming the order. Since the order is yet to be shipped, we will refund the money in next two working days');
		//session.say('Thanks for confirming your identity.');
    var balance=session.conversationData.orderNUmber%4;
	if(orderNumber < 10000 || orderNumber >1000000){
		//session.send('Please enter a valid order number');
		//session.endDialog();
		session.beginDialog('handleProductStatusInvalid');
		//session.endDialog();
		//session.
	}else{
		session.beginDialog('handleProductStatusValid');
		session.endDialog();
	}
   

	}
]);
/*.triggerAction({
    matches: [/order status/i,/status/i, /orderstatus/],
    onInterrupted: function (session) {
      //  session.send('Starting Order Cancellation');
    }
});
*/
bot.dialog('handleProductStatusValid', [
    function (session) {
       // session.send('Welcome to the Hotels finder! We are analyzing your message: \'%s\'', session.message.text);
	   session.conversationData.lastops='handleProductStatusValid';
		var orderNumber=session.conversationData.orderNUmber;
        // try extracting entities
		session.send('Your order has been shipped. You will be receiving it in 3 days');
		session.send('Please let us know how we may help with your order');
		session.endDialog();

    }
]);



bot.dialog('handleOrderCancellationSimplified', [
    function (session) {
         session.conversationData.lastops='askReasonForOrderCancellation';
		builder.Prompts.text(session, 'Please let us know your reason for cancelling your order');

    },
  /*  function (session, results) {
		//TODO Order number validation
		builder.Prompts.text(session, 'Thanks for providing the order number. In order to ensure authenticity, we have emailed a OTP send an OTP to the e-mail Id of the order and also the telephone number. Please enter the number to proceed further');
  },*/
	function (session, results) {
		
		session.send('Your order has been cancelled');
		session.conversationData.lastops='ordercancelreasonaskedandresultderived';
		var messageEnteredByUser=results.response;
        console.log('In final step of delay delivery, message entered is: %s',messageEnteredByUser);
        if(results.response){
          var intent='';
          LUISclient.predict(results.response, {

              //On success of prediction
                onSuccess: function (response) {
                var intent = response.topScoringIntent.intent;
                var intentsSize=response.intents.length;
                console.log('Intents length is %s',intentsSize);
                console.log('intent received is %s',response.topScoringIntent.intent);
                //printOnSuccess(response);
                console.log('Intent is:. %s',intent);
                //var messageToSend=getTextForIntent(intent);
                if (intent == 'ShowingSignsOfLeaving' || intent == 'Escalation' || intent == 'Delay_Angry' ){ 
                  session.beginDialog("handleEscalationOption");
                }else {
                  session.send('As a preferred customer, we would like to offer you $50 discount coupon.');
				  session.send('Coupon details have been e-mailed to you.');
				  //session.endConversation();
				  //session.beginDialog("generalConversationNew");
				  session.endDialog();
                }

              },

            //On failure of prediction
               onFailure: function (err) {
                console.error(err);
              }
            });
          }
		

	}
]);

bot.dialog('handleEscalationOption', [
    function (session) {
		session.conversationData.lastops='askingescalationchoice';
       builder.Prompts.choice(session, "Hope we were able to cater to your needs. Would you like to talk to a representative?", "Yes|No", { listStyle: builder.ListStyle.button });
    },
    function (session,results) {
       var decision=results.response;
       if(session.message.text == 'YES' || session.message.text == 'Yes'){
         session.send('You may contact 1-434-385-5775 for any questions');
		 session.conversationData.lastops='customerchosentoescalate';
		 session.endDialog();
		// session.send('You may contact 1-434-385-5775 for any questions');
       }else{
		    session.conversationData.lastops='customerchosennottoescalate';
		   session.send('Thank you for contacting us.');
		  
			session.endDialog();
	   }
	   

    }
]);



bot.dialog('NotAngryDuetoDelay', [
    function (session) {
        session.send("Customer satisfaction is our top priority. We are striving hard. We would like to offer $50 voucher. You would receive e-mail with details soon");
        session.send("Please provide your feedback or how would like us to help you in any ways");
		session.endDialog();
    }
]);

bot.dialog('handleAddressChange', [
    function (session) {
		session.conversationData.lastops='startedaddresschange';
       builder.Prompts.text(session, "Please enter the new address to which you would like to ship your product(Enter in a signle line)");
    },
    function (session,results) {
		session.conversationData.lastops='endedaddresschange';
       session.send('Your order will be delivered to your new address.');
	   session.send('Thank you for contacting us.');
	   //session.endConversation();
	   session.endDialog();

    }
]).triggerAction({
    matches: [/address change/i,/change address/i, /update address/i, /order address/i,/update order address/i,/change order address/i],
    onInterrupted: function (session) {
        session.send('Please enter the new address to which you would like to ship your product(Enter in a signle line)');
    }
});

bot.dialog('handlePositiveFeedback', [
    function (session) {
		session.conversationData.lastops='feedbackpositive';
       session.send("I am glad that I am able to help you. If you have any more assistance, I would be happy to help");
	   session.endDialog();
    }
]);
/*
bot.dialog('handleNegativeFeedback', [
    function (session) {
		session.conversationData.lastops='negativefeedback';
       session.send("I am glad that I am able to help you. If you have any more assistance, I would be happy to help");
	   session.endDialog();
    }
]);
*/
bot.dialog('handleOfferRequests', [
    function (session) {
       //builder.Prompts.text(session, "Please enter the new address to which you would like to ship your product(Enter in a signle line)");
	   session.conversationData.lastops='showoffers';
	   session.send("Following offers are currently available 1. 10% off on all purchases above $200. 2. Free next day delivery on all orders above $100 3.Free shipping on all orders above $75");
	   session.endDialog();
    }
]).triggerAction({
    matches: [/offer/i,/offer available/i, /offers available/i, /active offers/i,/active offer/i],
    onInterrupted: function (session) {
        session.send("Following offers are currently available 1. 10% off on all purchases above $200. 2. Free next day delivery on all orders above $100 3.Free shipping on all orders above $75");
    }
});

bot.dialog('NA', [
    function (session) {
		
		if(session.conversationData.lastops == 'ClosingNotes_Happy' || session.message.text.toUpperCase() == 'OK'){
					session.send("Thanks");
					session.endDialog();
		}else{
			
			session.conversationData.lastops='handleNA';
		
			//builder.Prompts.text(session, "Please enter the new address to which you would like to ship your product(Enter in a signle line)");
			session.send("We are sorry, you have typed a request we could not help you");
			session.send("Please type a question related to your jcrew.com experience");
			//session.endConversation();
			session.endDialog();
		}
    }
]);

bot.dialog('handleMonologue', [
    function (session) {
		
		
			session.conversationData.lastops='monologue';
		
			//builder.Prompts.text(session, "Please enter the new address to which you would like to ship your product(Enter in a signle line)");
			session.send("...");
			//session.send("Please type a question related to your jcrew.com experience");
			//session.endConversation();
			session.endDialog();
		
    }
]);

bot.dialog('handleunsupportedops', [
    function (session) {
		
		
			session.conversationData.lastops='unsupportedops';
		
			//builder.Prompts.text(session, "Please enter the new address to which you would like to ship your product(Enter in a signle line)");
			session.send("Sorry, currently we can help you in order status check, order cancellation and address change.");
			session.send("Soon we will be able to help in your request. ");
			 session.send('You may contact 1-434-385-5775 for your request');
			//session.send("Please type a question related to your jcrew.com experience");
			//session.endConversation();
			session.endDialog();
		
    }
]);

bot.dialog('whatcanyoudo', [
    function (session) {
		
		
			session.conversationData.lastops='whatcanyoudo';
		
			//builder.Prompts.text(session, "Please enter the new address to which you would like to ship your product(Enter in a signle line)");
			session.send("I can help you in order status check, order cancellation and address change.");
		
			//session.send("Please type a question related to your jcrew.com experience");
			//session.endConversation();
			session.endDialog();
		
    }
]);

 


bot.dialog('handleIntroduction', [
    function (session) {
		session.conversationData.lastops='handleIntroduction';
       //builder.Prompts.text(session, "Please enter the new address to which you would like to ship your product(Enter in a signle line)");
	   session.send("Please let us know how we can help you. We can help you to improve youe shopping experience with jcrew.com");
	  // session.send("Please type a question related to your jcrew.com experience");
	  session.endDialog();
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
		chatreplytext='Type your questions and we will help you';
	}else if(intentvalue == 'offers'){
		chatreplytext='Following offers are currently available 1. 10% off on all purchases above $200. 2. Free next day delivery on all orders above $100 3.Free shipping on all orders above $75';
	}else if (intentvalue == 'ReturnReason_LateDeliveryTime'){
    chatreplytext = 'We are sorry that we take longer than your expected time';
  }else if(intentvalue == 'Delay_Angry'){
    chatreplytext = 'We understand your Anxiety. But due to incliment weather, our deliveries are getting delayed.';
  }else if(intentvalue == 'ShowingSignsOfLeaving'){
    chatreplytext = 'Customer satisfaction is our top priority. We are striving hard. We would like to offer one year free premium membership';
  }else if(intentvalue == 'NotAngryDuetoDelay'){
    chatreplytext = 'Customer satisfaction is our top priority. We are striving hard. We would like to offer $50 voucher';
  }else if(intentvalue == 'ClosingNotes_Happy'){
    chatreplytext = 'I am glad that I was able to help you. Thank you';
  }else{
		chatreplytext='Please contact our customer support at 1-800-562-0258 to help you further.';
	}
	
	return chatreplytext;
}

function getDialogForIntent(intentVal){
  var chosendialog='NA';

  if(intentVal == 'ReturnReason_LateDeliveryTime'){
    chosendialog='lateDelivery';
  }
  if (intentVal == 'ReturnReason_NotRequiredAlreadyObtained'){
    chosendialog='productNotRequired';
  }
  if (intentVal == 'ReturnAndCancellation'){
    chosendialog='handleOrderCancellation';
	//chosendialog='handleOrderCancellationNoOrderNumber';
  }
  if(intentVal == 'OrderStatus'){
    chosendialog='handleProductStatus';
  }
  if(intentVal == 'Introduction'){
    chosendialog='handleIntroduction';
  }
  if(intentVal == 'NA'){
    chosendialog='NA';
  }
  if(intentVal == 'ClosingNotes_Happy' ){
	  chosendialog='handlePositiveFeedback';
  }
  if(intentVal == 'ClosingNotes_UnHappy'  || intentVal =='ShowingSignsOfLeaving' || intentVal =='Escalation' || intentVal =='Delay_Angry'){
	  chosendialog='handleEscalationOption';
  }
  if(intentVal == 'offers' ){
	  chosendialog='handleOfferRequests';
  }
  if(intentVal == 'thinkingmonologue' ){
	  chosendialog='handleMonologue';
  } 
  if(intentVal == 'unsupportedoperations' ){
	  chosendialog='handleunsupportedops';
  }
   if(intentVal == 'whatcanyoudo' ){
	  chosendialog='whatcanyoudo';
  }
   
  
  
   
  return chosendialog;
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

function handleIntentForMessages(session){
	
		var intent='NA';
		
		LUISclient.predict(session.message.text, {
			
				//On success of prediction
					onSuccess: function (response) {
					intent = response.topScoringIntent.intent;
					console.log('Response is');
					console.log(response.topScoringIntent);
					console.log(response)
					var score= response.topScoringIntent.score;
					
					
					console.log('intent received is %s',response.topScoringIntent.intent);
					
					console.log('Intent is:. %s',intent);
					if(score < 0.4){
						console.log('Setting intent to NA as score of top scoring intetnt is %s',score);
						intent='NA';
					}
						var dialog=getDialogForIntent(intent);
						session.beginDialog(dialog);
					},

			//On failure of prediction
					onFailure: function (err) {
					console.error(err);
				}
		});
		
}


function getIntentForMessage(session){
		
		
		LUISclient.predict(session.message.text, {
					
				//On success of prediction
					onSuccess: function (response) {
						var intent='NA';
					intent = response.topScoringIntent.intent;
					console.log('Response is');
					console.log(response.topScoringIntent);
					console.log(response)
					var score= response.topScoringIntent.score;
					
					
					console.log('intent received in getIntentForMessage is %s',response.topScoringIntent.intent);
					
					console.log('Intent getIntentForMessage is:. %s',intent);
					if(score < 0.4){
						console.log('Setting intent in getIntentForMessage to NA as score of top scoring intetnt is %s',score);
						intent='NA';
					}
					return intent;
					},

			//On failure of prediction
					onFailure: function (err) {
					console.error(err);
					var intent='NA';
				}
		});
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
