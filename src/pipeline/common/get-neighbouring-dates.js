import moment from "moment";
import {concat, range} from "ramda";

import {WEEKS} from "./config";

export default function getNeighbouringDates (date) {
    /*
    *   NOTE: moment's add and subtract methods take into account DST shifts
    */
    var before = range(1, WEEKS).map(n => {
        return moment(date).subtract(n, "weeks").valueOf();
    }).sort();
    var after = range(1, WEEKS).map(n => {
        return moment(date).add(n, "weeks").valueOf();
    });
    return concat(before, after);
}
