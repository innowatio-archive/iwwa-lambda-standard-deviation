import BPromise from "bluebird";
import {partial} from "ramda";

import aggregate from "./aggregate";
import insertPodReading from "./insert-pod-reading";
import retrievePodReadings from "./retrieve-pod-readings";

/*
*   A podReading is an object with the following shape:
*
*       {
*           date: Number, (unix timestamp)
*           podId: String,
*           type: String, (one of "attiva", "reattiva", "passiva")
*           value: Number,
*           unitOfMeasurement: String
*       }
*
*/

export default function podReadingPipeline (reading) {
    return BPromise
        .then(partial(insertPodReading, reading))
        .then(partial(retrievePodReadings, reading))
        .then(partial(aggregate, reading));
}
