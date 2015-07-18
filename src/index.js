import BPromise from "bluebird";

import podReadingPipeline from "./pipeline";

export function recordToReading (record) {
    var payload = new Buffer(record.kinesis.data, "base64").toString("ascii");
    return JSON.parse(payload);
}

export function handler (event, context) {
    return BPromise
        .map(event.Records, recordToReading)
        .map(podReadingPipeline)
        .then(() => context.succeed())
        .catch(err => context.fail(err));
}
