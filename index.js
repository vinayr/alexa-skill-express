// Alexa Fact Skill - Sample for Beginners

const Alexa = require("ask-sdk-core");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

const enData = {
  SKILL_NAME: "Vin Facts",
  GET_FACT_MESSAGE: "Here's your fact: ",
  HELP_MESSAGE: "You can say tell me a space fact, or, you can say exit... What can I help you with?",
  HELP_REPROMPT: "What can I help you with?",
  FALLBACK_MESSAGE:
    "The Space Facts skill can't help you with that.  It can help you discover facts about space if you say tell me a space fact. What can I help you with?",
  FALLBACK_REPROMPT: "What can I help you with?",
  ERROR_MESSAGE: "Sorry, an error occurred.",
  STOP_MESSAGE: "Goodbye!",
  FACTS: [
    "A year on Mercury is just 88 days long.",
    "Despite being farther from the Sun, Venus experiences higher temperatures than Mercury.",
    "On Mars, the Sun appears about half the size as it does on Earth.",
    "Jupiter has the shortest day of all the planets.",
    "The Sun is an almost perfect sphere."
  ]
};

// core functionality for fact skill
const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return (
      request.type === "LaunchRequest" ||
      (request.type === "IntentRequest" && request.intent.name === "GetNewFactIntent")
    );
  },
  handle(handlerInput) {
    const randomFact = enData["FACTS"][Math.floor(Math.random() * enData["FACTS"].length)];
    // concatenates a standard message with the random fact
    const speakOutput = enData["GET_FACT_MESSAGE"] + randomFact;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withSimpleCard(enData["SKILL_NAME"], randomFact)
      .getResponse();
  }
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === "IntentRequest" && request.intent.name === "AMAZON.HelpIntent";
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(enData["HELP_MESSAGE"])
      .reprompt(enData["HELP_REPROMPT"])
      .getResponse();
  }
};

const FallbackHandler = {
  // 2018-Aug-01: AMAZON.FallbackIntent is only currently available in en-* locales.
  //              This handler will not be triggered except in those locales, so it can be
  //              safely deployed for any locale.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === "IntentRequest" && request.intent.name === "AMAZON.FallbackIntent";
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(enData["FALLBACK_MESSAGE"])
      .reprompt(enData["FALLBACK_REPROMPT"])
      .getResponse();
  }
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      (request.intent.name === "AMAZON.CancelIntent" || request.intent.name === "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.speak(enData["STOP_MESSAGE"]).getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === "SessionEndedRequest";
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    return handlerInput.responseBuilder
      .speak(enData["ERROR_MESSAGE"])
      .reprompt(enData["ERROR_MESSAGE"])
      .getResponse();
  }
};

const skillBuilder = Alexa.SkillBuilders.custom();

const skill = skillBuilder
  .addRequestHandlers(GetNewFactHandler, HelpHandler, ExitHandler, FallbackHandler, SessionEndedRequestHandler)
  .addErrorHandlers(ErrorHandler)
  .create();

const RequestHandler = (req, res) => {
  console.log("===REQUEST===\n", JSON.stringify(req.body));
  skill
    .invoke(req.body)
    .then(response => res.json(response))
    .catch(error => {
      console.log("Error in skill", error);
      res.sendStatus(500);
    });
};

app.use(bodyParser.json());
app.post("/", RequestHandler);
app.listen(port);
console.log("Alexa listening on port", port);
