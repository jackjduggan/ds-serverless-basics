import { Handler } from "aws-lambda";

import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: Handler = async (event, context) => {
  try {
    console.log("Event: ", event);
    // const parameters = event?.queryStringParameters;
    // const movieId = parameters ? parseInt(parameters.movieId) : undefined;

    // if (!movieId) {
    //   return {
    //     statusCode: 404,
    //     headers: {
    //       "content-type": "application/json",
    //     },
    //     body: JSON.stringify({ Message: "Missing movie Id" }),
    //   };
    // }
    const commandOutput = await ddbDocClient.send(
      new ScanCommand({
        TableName: process.env.TABLE_NAME,
        // Key: { movieId: movieId },
      })
    );
    //console.log('GetCommand response: ', commandOutput)  // NEW
    const allMovies = commandOutput.Items; // originally I didn't have this statement and just called
    if (!allMovies) {                      //  commandOutput.Items wherever there's "allMovies", but it didn't work.
      return {                             // Converting to allMovies const variable fixed the error and URL worked.
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ Message: "No movies" }),
      };
    }
    const body = {
      data: allMovies,
    };

    // Return Response
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    };
  } catch (error: any) {
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error }),
    };
  }
};

function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = {
    wrapNumbers: false,
  };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}