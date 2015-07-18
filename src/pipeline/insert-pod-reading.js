import buildPodReadingKey from "./common/build-pod-reading-key";
import {TABLE_NAME} from "./common/config";
import dynamodb from "./common/dynamodb";

export default function insertPodReading (reading) {
    return dynamodb.putItemAsync({
        ExpressionAttributeNames: {
            "#date": "date",
            "#readingId": "readingId",
            "#value": "value"
        },
        Item: {
            "#date": {
                N: reading.date.toString()
            },
            "#readingId": {
                S: buildPodReadingKey(reading)
            },
            "#value": {
                N: reading.value.toString()
            }
        },
        TableName: TABLE_NAME
    });
}
