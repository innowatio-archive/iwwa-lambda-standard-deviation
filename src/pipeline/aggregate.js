import moment from "moment";
import {aperture, find, identity, last, prop, propEq, sortBy} from "ramda";
import {mean, standardDeviation} from "simple-statistics";

import {WEEKS} from "./common/config";
import getNeighbouringDates from "./common/get-neighbouring-dates";

function findCorrespondingValue (neighbouringReadings, date) {
    var correspondingReading = find(propEq(date, "date"), neighbouringReadings);
    return correspondingReading && correspondingReading.value;
}

function buildReadingsRange (reading, neighbouringReadings) {
    var neighbouringRange = getNeighbouringDates(reading.date).map(date => {
        return {
            date: date,
            value: findCorrespondingValue(neighbouringReadings, date)
        };
    });
    var unsortedRange = neighbouringRange.concat({
        date: reading.date,
        value: reading.value
    });
    return sortBy(prop("date"), unsortedRange);
}

export default function aggregate (reading, neighbouringReadings) {
    var readingsRange = buildReadingsRange(reading, neighbouringReadings);
    return aperture(WEEKS, readingsRange).map(set => {
        var values = set.map(prop("value")).filter(identity);
        return {
            date: moment(last(set).date).add(1, "week").valueOf(),
            mean: mean(values),
            standardDeviation: standardDeviation(values)
        };
    });
}
