import {assoc} from "ramda";

import buildPodReadingKey from "./common/build-pod-reading-key";
import {TABLE_NAME} from "./common/config";
import dynamodb from "./common/dynamodb";
import getNeighbouringDates from "./common/get-neighbouring-dates";

function getNeighbouringPodReadingsKeys (reading) {
    return getNeighbouringDates(reading.date)
        .map(date => {
            return buildPodReadingKey(assoc("date", date, reading));
        });
}

export default function retrievePodReadings (reading) {
    return dynamodb.batchGetItemAsync({
        RequestItems: {
            [TABLE_NAME]: {
                Keys: getNeighbouringPodReadingsKeys(reading)
            }
        }
    });
}
